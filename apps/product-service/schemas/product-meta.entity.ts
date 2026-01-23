import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Products } from './products.entity';

@Entity('product_meta')
export class ProductMeta {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Products;

  @Column({ type: 'varchar', length: 100 })
  barcode: string;

  @Column({ type: 'text' })
  qr_code: string;
}
