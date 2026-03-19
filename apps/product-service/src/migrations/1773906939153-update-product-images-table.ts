import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductImagesTable1773906939153 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_images"
             ADD COLUMN "variant_id" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "product_images"
             ADD CONSTRAINT "FK_product-images-variant-id"
             FOREIGN KEY ("variant_id")
             REFERENCES "product-variants"("id")
             ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_images"
             DROP CONSTRAINT "FK_product_images_variant_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "product_images"
             DROP COLUMN "variant_id"`,
    );
  }
}
