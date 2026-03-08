import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user-roles')
export class UserRoles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column()
  role: string;
}
