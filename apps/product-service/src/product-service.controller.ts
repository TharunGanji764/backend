import { Controller, Get } from '@nestjs/common';
import { ProductServiceService } from './product-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { CreateProduct } from '../types/create-product.types';

@Controller()
export class ProductServiceController {
  constructor(private readonly productServiceService: ProductServiceService) {}

  @MessagePattern('get_products')
  async getProductsData(@Payload() data: { page: number; limit: number }) {
    return await this.productServiceService.getProducts(data?.page, data.limit);
  }

  @MessagePattern('get_categories')
  async getCategories() {
    return await this.productServiceService.getCategories();
  }

  @MessagePattern('get_product_details')
  async getProductDetails(@Payload() data: { id: string }) {
    return await this.productServiceService.getProductDetails(data?.id);
  }

  @MessagePattern('get_ProductData')
  async getProductData(@Payload() data: { product_id: string }) {
    return await this.productServiceService.getProductDataForAddToCart(
      data?.product_id,
    );
  }

  @MessagePattern('get_search_data')
  async getSearchData(@Payload() data: { query: string }) {
    return await this.productServiceService.getSearchData(data);
  }

  @MessagePattern('add_to_wishlist')
  async addToWishList(@Payload() data: any) {
    return await this.productServiceService.addToWishList(data);
  }

  @MessagePattern('get_wishlist')
  async getWishList(@Payload() data: any) {
    return await this.productServiceService.getWishList(data);
  }

  @MessagePattern('get_products_by_category')
  async getProductsByCategory(@Payload() data: any) {
    return await this.productServiceService.getProductsByCategory(data);
  }

  @MessagePattern('create-product')
  async createProduct(
    @Payload()
    data: {
      productData: CreateProduct;
      userId: any;
    },
  ) {
    return await this.productServiceService.createProduct(data);
  }
}
