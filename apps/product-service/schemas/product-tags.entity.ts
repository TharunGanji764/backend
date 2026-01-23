import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Products } from './products.entity';

@Entity('product-tags')
export class ProductTags {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Products, (product) => product.tags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Products;

  @Column({ type: 'varchar', length: 50 })
  tag: string;
}
