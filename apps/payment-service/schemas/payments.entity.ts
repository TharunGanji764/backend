import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../enums/enums';

@Entity('payments')
export class Payments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: false })
  order_id: string;

  @Column({ nullable: true })
  payment_intent_id: string;

  @Column({ nullable: true })
  payment_secret_key: string;

  @Column({ nullable: false, type: 'decimal', scale: 2 })
  amount: number;

  @Column({ nullable: false })
  currency: string;

  @Column({ nullable: false, enum: PaymentStatus, type: 'enum' })
  status: string;

  @Column()
  provider: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
