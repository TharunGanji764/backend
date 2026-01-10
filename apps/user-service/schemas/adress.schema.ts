import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToOne(() => Users, (user) => user.address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
