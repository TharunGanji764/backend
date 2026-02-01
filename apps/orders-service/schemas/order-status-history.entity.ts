import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Orders } from './orders.entity';
import { OrderStatus } from '../enums/enums';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Orders, (order) => order.statusHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Orders;

  @Column({ type: 'enum', enum: OrderStatus })
  status: string;

  @Column()
  changedBy: string;

  @CreateDateColumn()
  changedAt: Date;
}
