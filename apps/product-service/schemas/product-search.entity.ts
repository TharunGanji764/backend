import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('product_search')
export class ProductSearch {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  product_id: string;

  @Column()
  product_name: string;

  @Column()
  category: string;

  @Column('numeric')
  price: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updated_at: Date;
}
