import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductTable1773250135149 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL, ALTER COLUMN "discount_percentage" DROP NOT NULL, ALTER COLUMN "discounted_price" DROP NOT NULL, ALTER COLUMN "stock" DROP NOT NULL, ALTER COLUMN "rating" DROP NOT NULL, ALTER COLUMN "thumbnail" DROP NOT NULL; `,
    );
    await queryRunner.query(
      ` ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'draft'; `,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL, ALTER COLUMN "discount_percentage" SET NOT NULL, ALTER COLUMN "discounted_price" SET NOT NULL, ALTER COLUMN "stock" SET NOT NULL, ALTER COLUMN "rating" SET NOT NULL, ALTER COLUMN "thumbnail" SET NOT NULL; `,
    );
    await queryRunner.query(
      ` ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'active'; `,
    );
  }
}
