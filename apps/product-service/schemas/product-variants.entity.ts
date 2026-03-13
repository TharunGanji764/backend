import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Products } from './products.entity';
import { ProductVariantsAttributes } from './product-variant-attributes.entity';

@Entity('product_variants')
export class ProductVariants {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Products, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Products;

  @Column({ type: 'varchar', nullable: false, length: 30 })
  sku: string;

  @Column({ type: 'numeric', nullable: false, precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: false })
  stock: number;

  @Column({ type: 'varchar', nullable: true, default: 'active', length: 20 })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProductVariantsAttributes, (attribute) => attribute.variant)
  attributes: ProductVariantsAttributes[];
}
