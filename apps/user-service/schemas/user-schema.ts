import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Address } from './adress.schema';

@Entity()
export class Users {
  @PrimaryColumn()
  user_id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  profile_image: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  email_id: string;

  @OneToMany(() => Address, (address) => address.user)
  address: Address;
}
