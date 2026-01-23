import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Products } from './products.entity';

@Entity('product_images')
export class ProductImages {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Products, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Products;

  @Column({ type: 'text' })
  imageUrl: string;
}
