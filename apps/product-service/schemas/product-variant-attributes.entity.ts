import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariants } from './product-variants.entity';

@Entity('product-variants-attributes')
export class ProductVariantsAttributes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductVariants, (variants) => variants.attributes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariants;

  @Column({ type: 'varchar', nullable: false })
  attribute_name: string;

  @Column({ type: 'varchar', nullable: false })
  attribute_value: string;
}
