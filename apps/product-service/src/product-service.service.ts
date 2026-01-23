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

  async getProducts() {
    const productsData = await this.productsRepository.find();
    return { data: productsData };
  }
}
