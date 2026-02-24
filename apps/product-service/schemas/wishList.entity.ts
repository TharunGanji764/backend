import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wishlist')
export class WishListEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  product_id: string;

  @Column({ nullable: false })
  product_name: String;

  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
  product_rating: number;

  @Column()
  product_image: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  discount_percentage: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  discounted_price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  product_price: number;

  @Column('uuid')
  user_id: string;
}
