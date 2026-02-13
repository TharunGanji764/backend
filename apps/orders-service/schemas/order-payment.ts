import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Orders } from './orders.entity';

@Entity('order_payments')
export class OrderPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Orders, (order) => order.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Orders;

  @Column()
  payment_provider: string;

  @Column()
  payment_reference: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
