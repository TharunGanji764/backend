import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from '../schemas/products.entity';
import { Repository } from 'typeorm';
import { ProductSearch } from '../schemas/product-search.entity';
import { WishListEntity } from '../schemas/wishList.entity';
import { RpcException } from '@nestjs/microservices';
import { CreateProduct } from '../types/create-product.types';
import { ProductStatus } from '../enums/product.enum';

@Injectable()
export class ProductServiceService {
  constructor(
    @InjectRepository(Products)
    private productsRepository: Repository<Products>,
    @InjectRepository(ProductSearch)
    private productSearchRepository: Repository<ProductSearch>,
    @InjectRepository(WishListEntity)
    private wishListRepository: Repository<WishListEntity>,
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

  async getSearchData(filters: any) {
    const { query } = filters;
    const filteredData = await this.productSearchRepository
      .createQueryBuilder('data')
      .select(['data.product_name', 'data.category', 'data.product_id'])
      .where(
        `(data.product_name ILIKE :ilikeQuery OR data.product_name % :rawQuery)`,
        {
          ilikeQuery: `%${query}%`,
          rawQuery: query,
        },
      )
      .orderBy('similarity(data.product_name,:rawQuery)', 'DESC')
      .getMany();
    return filteredData;
  }

  async addToWishList(data: any) {
    const { productId, sub: userId } = data;
    const isItemAvailableInWishList = await this.wishListRepository.findOne({
      where: { product_id: productId },
    });
    const productData = await this.productsRepository.findOne({
      where: { sku: productId },
      select: [
        'thumbnail',
        'sku',
        'price',
        'discount_percentage',
        'discounted_price',
        'rating',
        'title',
      ],
    });
    if (!productData) {
      throw new RpcException({
        message: 'Product is  Not Available',
      });
    }
    if (isItemAvailableInWishList) {
      throw new RpcException({
        message: 'Item Already available in wishlist',
      });
    }
    const wishListItem = await this.wishListRepository.create({
      product_id: productData?.sku,
      discount_percentage: productData?.discount_percentage,
      discounted_price: productData?.discounted_price,
      product_image: productData?.thumbnail,
      product_name: productData?.title,
      product_price: productData?.price,
      product_rating: productData?.rating,
      user_id: userId,
    });
    await this.wishListRepository.save(wishListItem);
    return wishListItem;
  }

  async getWishList(userId: string) {
    const [wishListData, count] = await this.wishListRepository.findAndCount({
      where: { user_id: userId },
    });
    return { data: wishListData, count };
  }

  async getProductsByCategory(data: any) {
    const { category } = data;
    const productsByCategory = await this.productsRepository
      .createQueryBuilder('product')
      .select([
        'product.sku',
        'product.title',
        'product.category',
        'product.brand',
        'product.price',
        'product.discount_percentage',
        'product.discounted_price',
        'product.rating',
        'product.thumbnail',
        'product.availability_status',
      ])
      .where(`product.category %:category`, { category })
      .getMany();
    return productsByCategory;
  }

  async createProduct(data: { productData: CreateProduct; userId: string }) {
    const {
      brand,
      category,
      full_description,
      product_name,
      short_description,
    } = data?.productData;
    const { userId } = data;
    const newProduct = await this.productsRepository.create({
      title: product_name,
      brand,
      category,
      full_description: full_description,
      description: short_description,
      status: ProductStatus?.DRAFT,
      seller_id: userId,
    });
    await this.productsRepository.save(newProduct);
    return {
      product_id: newProduct?.id,
      message: 'Product created successfully',
    };
  }
}
