import { CartItem } from './../schemas/cart-item.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Cart } from '../schemas/cart.entity';
import { Repository } from 'typeorm';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';

@Injectable()
export class CartServiceService implements OnModuleInit {
  constructor(
    @Inject('PRODUCT_SERVICE')
    private readonly productServiceClient: ClientProxy,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    private readonly rabbitMqClient: RabbitmqService,
  ) {}

  async onModuleInit() {
    const channel = await this.rabbitMqClient.getChannel();
    await channel.prefetch(1);

    await channel.consume('cart.status.result', async (msg) => {
      if (!msg) return;
      try {
        const data = JSON.parse(msg.content.toString());
        if (data?.status === 'success') {
          await this.clearCart(data?.userId);
        }
        channel.ack(msg);
      } catch (err) {
        console.log('Consumer error', err);
        channel.nack(msg, false, false);
      }
    });
  }

  async getCartItems(userData: any) {
    const cart = await this.cartRepository.findOne({
      where: { user_id: userData?.sub },
    });

    if (!cart) {
      return {
        status: 404,
        message: 'No cart available',
      };
    }
    const cartItems = await this.cartItemsRepository.find({
      where: { cart: { id: cart?.id } },
    });
    return {
      cartId: cart?.id,
      items: cartItems,
    };
  }

  async addToCart(itemData: any, user: any) {
    const productData = await firstValueFrom(
      this.productServiceClient.send('get_ProductData', { ...itemData }),
    );

    const userId = user?.sub;

    let existingCart = await this.cartRepository.findOne({
      where: { user_id: userId },
    });

    if (!existingCart) {
      existingCart = await this.cartRepository.save({ user_id: userId });
    }

    const existingCartItem = await this.cartItemsRepository.findOne({
      where: {
        cart: { id: existingCart?.id },
        product_id: productData?.sku,
      },
    });

    if (existingCartItem) {
      existingCartItem.quantity += 1;
      await this.cartItemsRepository.save(existingCartItem);
      return { data: existingCartItem };
    }

    const cartItem = this.cartItemsRepository.create({
      product_id: productData?.sku,
      product_name: productData?.title,
      product_image: productData?.thumbnail,
      price: productData?.price,
      quantity: 1,
      cart: existingCart,
    });
    const { cart, ...rest } = cartItem;

    await this.cartItemsRepository.save(cartItem);

    return { data: rest };
  }

  async editCart(action: 'Increment' | 'Decrement', itemId: string) {
    if (!itemId) {
      throw new BadRequestException('productId is required');
    }

    const cartItem = await this.cartItemsRepository.findOne({
      where: { product_id: itemId },
    });

    if (!cartItem) {
      return { message: 'Item Not Found' };
    }

    switch (action) {
      case 'Increment':
        cartItem.quantity += 1;
        await this.cartItemsRepository.save(cartItem);
        return {
          message: 'Quantity increased',
          item: cartItem,
        };

      case 'Decrement':
        cartItem.quantity -= 1;
        if (cartItem?.quantity <= 0) {
          await this.cartItemsRepository.remove(cartItem);
          return { message: 'Item removed from cart' };
        }
        await this.cartItemsRepository.save(cartItem);
        return {
          message: 'Quantity decreased',
          item: cartItem,
        };

      default:
        throw new BadRequestException('Invalid cart action');
    }
  }

  async removeFromCart(productId: string) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { product_id: productId },
    });

    if (!cartItem) {
      return { message: 'Item Not Found' };
    }
    await this.cartItemsRepository.remove(cartItem);
    return { message: 'item removed from cart' };
  }

  async clearCart(userId: string) {
    const cartData = await this.cartRepository.findOne({
      where: { user_id: userId },
    });

    if (!cartData) {
      return { message: 'No cart Available' };
    }
    await this.cartRepository.remove(cartData);
    return { message: 'Cart cleared' };
  }
}
