import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Orders } from './orders.entity';

@Entity('order_addresses')
export class OrderAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Orders, (order) => order.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Orders;

  @Column({ nullable: true })
  type: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column()
  country: string;
}
