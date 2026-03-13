import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductVariantsAttributesTable1773427342919 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product-variants-attributes"
      ADD COLUMN "attribute_value" varchar NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product-variants-attributes"
      DROP COLUMN "attribute_value"
    `);
  }
}
