import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Auth {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userid: string;

  @Column({ unique: true })
  emailId: string;

  @Column({})
  password: string;

  @Column({ default: true })
  is_active: boolean;
}
