import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Orders } from '../schemas/orders.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { OrderStatus, PaymentStatus } from '../enums/enums';
import { OrderStatusHistory } from '../schemas/order-status-history.entity';
import { OrderItems } from '../schemas/order-items.entity';
import { OrderAddress } from '../schemas/order-address.entity';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';

@Injectable()
export class OrdersServiceService implements OnModuleInit {
  constructor(
    @Inject('CART_SERVICE')
    private readonly cartService: ClientProxy,
    @InjectRepository(Orders)
    private orderRepo: Repository<Orders>,
    @InjectRepository(OrderStatusHistory)
    private orderStatusHistory: Repository<OrderStatusHistory>,
    @InjectRepository(OrderItems)
    private orderItems: Repository<OrderItems>,
    @InjectRepository(OrderAddress)
    private orderAddress: Repository<OrderAddress>,
    @Inject('USERS_SERVICE')
    private readonly userService: ClientProxy,
    private readonly rabbitMQClient: RabbitmqService,
    @Inject('PAYMENT_SERVICE')
    private readonly paymentService: ClientProxy,
  ) {}

  async onModuleInit() {
    const channel = await this.rabbitMQClient.getChannel();
    await channel.prefetch(1);

    await channel.consume('order.payment.result', async (msg) => {
      if (!msg) return;
      try {
        const data = JSON.parse(msg.content.toString());
        await this.consumePayment(data);
        channel.ack(msg);
      } catch (err) {
        console.log('Consumer error', err);
        channel.nack(msg, false, false);
      }
    });
  }

  async createOrder(data: any) {
    const { sub: user_id, username, mobile } = data?.userData;
    const { shippingAddressId } = data?.body;

    const isOrderExist = await this.orderRepo.findOne({
      where: {
        idempotency_key: data?.idempotencyKey,
      },
    });
    if (isOrderExist) {
      return {
        orderId: isOrderExist?.id,
        status: isOrderExist?.payment_status,
        totalAmount: isOrderExist?.total_amount,
        orderNumber: isOrderExist?.order_number,
      };
    }
    const cartItems = await firstValueFrom(
      this.cartService.send('get_CartData', {
        user_id,
      }),
    );
    const userAddressess = await firstValueFrom(
      this.userService.send('get_user_addressess', {
        userId: user_id,
        shippingAddressId,
      }),
    );
    const { items: cart } = cartItems;
    const totalAmount = cart?.reduce(
      (acc, item) => acc + item?.price * item?.quantity,
      0,
    );
    const orders = await this.orderRepo.count();
    if (!cartItems) {
      throw new RpcException({
        status: 404,
        message: 'No cart available',
      });
    }
    const year = new Date().getFullYear();
    const orderId = `ORD-${year}-${orders + 1}`;
    const order = await this.orderRepo.create({
      order_number: orderId,
      user_id: user_id,
      total_amount: totalAmount,
      address_id: shippingAddressId,
      currency: 'INR',
      status: OrderStatus?.CREATED,
      payment_status: PaymentStatus?.PENDING,
      idempotency_key: data?.idempotencyKey,
    });
    await this.orderRepo.save(order);
    const orderStatusHistory = this.orderStatusHistory.create({
      status: order?.status,
      order: order,
      changedBy: 'User',
    });
    await this.orderStatusHistory.save(orderStatusHistory);
    const orderItems = cart?.map((item) =>
      this.orderItems.create({
        product_id: item?.product_id,
        product_name: item?.product_name,
        product_image: item?.product_image,
        sku: item?.product_id,
        unit_price: item?.price,
        quantity: item?.quantity,
        total_price: item?.price * item?.quantity,
        order: order,
      }),
    );
    await this.orderItems.save(orderItems);

    const address = userAddressess?.filter(
      (userAddress: any) => userAddress?.id === shippingAddressId,
    );

    const orderAddress = await this.orderAddress.create({
      name: username,
      phone: mobile,
      addressLine1: address?.[0]?.address_line || 'Null',
      addressLine2: 'Null',
      city: address?.[0]?.city,
      state: address?.[0]?.state,
      postalCode: address?.[0]?.pincode,
      country: address?.[0]?.country || 'India',
      order: order,
    });
    await this.orderAddress.save(orderAddress);

    await firstValueFrom(
      this.paymentService.send('create_payment', {
        orderId: order?.id,
        orderNumber: orderId,
        totalAmount,
        currency: 'INR',
        userId: user_id,
      }),
    );
    return {
      orderId: order?.id,
      orderNumber: orderId,
      status: PaymentStatus?.PENDING,
      totalAmount,
    };
  }

  async getPaymentStatus(data: any) {
    const { OrderId } = data;
    const res = await firstValueFrom(
      this.paymentService.send('get_payment_By_Id', {
        OrderId,
      }),
    );
    return res;
  }

  async consumePayment(data: any) {
    console.log('data: ', data);
  }
}
