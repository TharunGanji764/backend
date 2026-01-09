import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Auth {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userid: string;

  @Column()
  username: string;

  @Column({ unique: true })
  emailId: string;

  @Column({})
  password: string;

  @Column()
  mobile: string;
}
