import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductMeta } from './product-meta.entity';
import { ProductTags } from './product-tags.entity';
import { ProductDimensions } from './product-dimensions.entity';
import { ProductImages } from './product-images.entity';
import { ProductReviews } from './product-reviews.entity';
import { ProductStatus } from '../enums/product.enum';

@Entity()
export class Products {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  full_description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  sku: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  discount_percentage: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  discounted_price: number;

  @Column({ type: 'int', nullable: true })
  stock: number;

  @Column({ type: 'text', nullable: true })
  warranty_information: string;

  @Column({ type: 'text', nullable: true })
  shipping_information: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  availability_status: string;

  @Column({ type: 'text', nullable: true })
  return_policy: string;

  @Column({ type: 'int', nullable: true })
  minimum_order_quantity: number;

  @Column({ type: 'text', nullable: true })
  thumbnail: string;

  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ type: 'uuid', nullable: true })
  seller_id: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => ProductMeta, (meta) => meta.product)
  meta: ProductMeta;

  @OneToMany(() => ProductTags, (tags) => tags.product)
  tags: ProductTags[];

  @OneToOne(() => ProductDimensions, (dimension) => dimension.product)
  dimensions: ProductDimensions;

  @OneToMany(() => ProductImages, (image) => image.product)
  images: ProductImages[];

  @OneToMany(() => ProductReviews, (review) => review.product)
  reviews: ProductReviews[];
}
