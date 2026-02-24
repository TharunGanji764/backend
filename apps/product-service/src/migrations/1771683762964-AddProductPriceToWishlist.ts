import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductPriceToWishlist1771683762964 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wishlist"
      ADD COLUMN "product_price" numeric(10,2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wishlist"
      DROP COLUMN "product_price"
    `);
  }
}
