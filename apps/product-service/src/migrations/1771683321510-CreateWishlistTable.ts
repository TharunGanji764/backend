import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWishlistTable1771683321510 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "wishlist" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" varchar NOT NULL,
        "product_name" varchar NOT NULL,
        "product_rating" numeric(3,2),
        "product_image" varchar NOT NULL,
        "discount_percentage" numeric(5,2),
        "discounted_price" numeric(10,2),
        "product_price" numeric(10,2),
        CONSTRAINT "UQ_wishlist_product_id" UNIQUE ("product_id"),
        CONSTRAINT "PK_wishlist_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "wishlist"`);
  }
}
