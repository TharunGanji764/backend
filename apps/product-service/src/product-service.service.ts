import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from '../schemas/products.entity';
import { In, Repository } from 'typeorm';
import { ProductSearch } from '../schemas/product-search.entity';
import { WishListEntity } from '../schemas/wishList.entity';
import { RpcException } from '@nestjs/microservices';
import { CreateProduct } from '../types/create-product.types';
import { ProductStatus } from '../enums/product.enum';
import { ProductVariants } from '../schemas/product-variants.entity';
import { ProductVariantsAttributes } from '../schemas/product-variant-attributes.entity';

@Injectable()
export class ProductServiceService {
  constructor(
    @InjectRepository(Products)
    private productsRepository: Repository<Products>,
    @InjectRepository(ProductSearch)
    private productSearchRepository: Repository<ProductSearch>,
    @InjectRepository(WishListEntity)
    private wishListRepository: Repository<WishListEntity>,
    @InjectRepository(ProductVariants)
    private productVariantsRepository: Repository<ProductVariants>,
    @InjectRepository(ProductVariantsAttributes)
    private ProductVariantsAttributesRepository: Repository<ProductVariantsAttributes>,
  ) {}

  async getProducts(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [productsData, total] = await this.productsRepository.findAndCount({
      take: limit,
      skip: offset,
      where: { status: ProductStatus?.ACTIVE },
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

  async addProductVariants(productdata: any) {
    const { productId, userId: sellerId, ...rest } = productdata;
    const { productData } = rest;
    const isProductExist = await this.productsRepository.findOne({
      where: { id: productId, seller_id: sellerId },
    });
    if (!isProductExist) {
      throw new RpcException({
        message: 'Product not found',
      });
    }
    const variants = productData?.map((variant: any) => ({
      product: { id: productId },
      sku: variant?.sku,
      price: variant?.price,
      stock: variant?.stock,
      status: 'active',
    }));
    const savedVariants = await this.productVariantsRepository.save(variants);
    const attributes: any[] = [];

    savedVariants?.forEach((savedVariant, variantIndex) => {
      const variantAttributes = productData[variantIndex]?.attributes;

      variantAttributes?.forEach((attr: any) => {
        attributes.push({
          variant: { id: savedVariant.id },
          attribute_name: attr?.attribute_name,
          attribute_value: attr?.attribute_value,
        });
      });
    });
    const savedAttributes =
      await this.ProductVariantsAttributesRepository.save(attributes);
    return { savedVariants, savedAttributes };
  }

  async updateProductVariants(productdata: any) {
    const { productId, userId: sellerId, ...rest } = productdata;
    const { productData } = rest;
    const isProductExist = await this.productsRepository.findOne({
      where: { id: productId, seller_id: sellerId },
    });
    if (!isProductExist) {
      throw new RpcException({
        message: 'Product not found',
      });
    }
    const newvariants = productData?.map((variant: any) => ({
      id: variant?.id,
      product: { id: productId },
      sku: variant?.sku,
      price: variant?.price,
      stock: variant?.stock,
      status: 'active',
      updated_at: new Date(),
    }));
    const savedVariants =
      await this.productVariantsRepository.save(newvariants);
    const variantIds = savedVariants?.map((variant: any) => variant?.id);
    await this.ProductVariantsAttributesRepository.delete({
      variant: { id: In(variantIds) },
    });
    const newattributes: any[] = [];
    savedVariants?.forEach((savedVariant, variantIndex) => {
      const variantAttributes = productData[variantIndex]?.attributes;

      variantAttributes?.forEach((attr: any) => {
        newattributes.push({
          variant: { id: savedVariant.id },
          attribute_name: attr.attribute_name,
          attribute_value: attr.attribute_value,
        });
      });
    });

    await this.ProductVariantsAttributesRepository.save(newattributes);
    return { message: 'variants updated successfully' };
  }

  async deleteProductAttributes(productdata: any) {
    const { productId, userId: sellerId, ...rest } = productdata;
    const { productData } = rest;
    const isProductExist = await this.productsRepository.findOne({
      where: { id: productId, seller_id: sellerId },
      relations: ['variants'],
    });
    if (!isProductExist) {
      throw new RpcException({
        message: 'Product not found',
      });
    }
    const variants = await this.ProductVariantsAttributesRepository.find({
      where: {
        attribute_name: productData?.name,
        attribute_value: productData?.value,
      },
      relations: ['variant'],
    });
    const variantIds = variants?.map((variant: any) => variant?.variant?.id);
    if (!variantIds) return;
    await this.ProductVariantsAttributesRepository.delete({
      variant: { id: In(variantIds) },
    });
    await this.productVariantsRepository.delete({
      id: In(variantIds),
    });
    return { message: 'variants updated successfully' };
  }

  async getSellerProducts(sellerId: any) {
    const sellerProducts = await this.productsRepository.find({
      where: { seller_id: sellerId },
      relations: ['variants', 'variants.attributes'],
      select: [
        'brand',
        'category',
        'createdAt',
        'description',
        'full_description',
        'id',
        'seller_id',
        'title',
      ],
    });
    return sellerProducts;
  }
}
