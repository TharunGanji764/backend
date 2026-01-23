import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Products } from './products.entity';

@Entity('product-dimensions')
export class ProductDimensions {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Products;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  depth: number;
}
