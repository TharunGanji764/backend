import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './user-schema';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address_line: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ length: 6 })
  pincode: string;

  @Column({ default: false })
  is_default: boolean;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  landmark: string;

  @Column({ nullable: true })
  tag: string;

  @ManyToOne(() => Users, (user) => user.address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
