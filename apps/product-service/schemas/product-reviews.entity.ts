import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Products } from './products.entity';

@Entity('product_reviews')
export class ProductReviews {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Products, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Products;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'timestamp', nullable: true })
  review_date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reviewer_name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  reviewer_email: string;
}
