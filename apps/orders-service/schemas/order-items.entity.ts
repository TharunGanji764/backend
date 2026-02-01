import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Orders } from './orders.entity';

@Entity('order_items')
export class OrderItems {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Orders, (order) => order?.Items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Orders;

  @Column()
  product_id: string;

  @Column({ type: 'varchar' })
  product_name: string;

  @Column()
  product_image: string;

  @Column({ type: 'varchar' })
  sku: string;

  @Column({ type: 'decimal' })
  unit_price: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal' })
  total_price: number;
}
