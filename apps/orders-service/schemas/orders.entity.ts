import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItems } from './order-items.entity';
import { OrderAddress } from './order-address.entity';
import { OrderPayment } from './order-payment';
import { OrderStatusHistory } from './order-status-history.entity';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../enums/enums';

@Entity('orders')
export class Orders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  order_number: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'enum', nullable: false, enum: OrderStatus })
  status: string;

  @Column({ type: 'decimal', nullable: false })
  total_amount: string;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus })
  payment_status: string;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  payment_method: string;

  @Column()
  address_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OrderItems, (items) => items?.order, {
    cascade: true,
  })
  Items: OrderItems[];

  @OneToMany(() => OrderAddress, (address) => address.order, {
    cascade: true,
  })
  addresses: OrderAddress[];

  @OneToMany(() => OrderPayment, (payment) => payment.order)
  payments: OrderPayment[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order, {
    cascade: true,
  })
  statusHistory: OrderStatusHistory[];
}
