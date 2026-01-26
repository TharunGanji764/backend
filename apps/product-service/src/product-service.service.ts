import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from '../schemas/products.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductServiceService {
  constructor(
    @InjectRepository(Products)
    private productsRepository: Repository<Products>,
  ) {}

  async getProducts(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [productsData, total] = await this.productsRepository.findAndCount({
      take: limit,
      skip: offset,
    });
    return { page, limit, total, data: productsData };
  }

  async getCategories() {
    const categoriesData = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .getRawMany();
    const result = categoriesData?.map((category: any) => category?.category);
    return result;
  }

  async getProductDetails(id: string) {
    const productDetails = await this.productsRepository.findOne({
      where: { sku: id },
      relations: ['dimensions', 'images', 'reviews'],
    });
    return productDetails;
  }

  async getProductDataForAddToCart(id: string) {
    const productDetails = await this.productsRepository
      .createQueryBuilder('product')
      .select([
        'product.sku',
        'product.title',
        'product.price',
        'product.thumbnail',
      ])
      .where('product.sku=:id', { id })
      .getOne();
    return productDetails;
  }
}
