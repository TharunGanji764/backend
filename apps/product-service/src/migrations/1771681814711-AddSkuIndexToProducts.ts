import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSkuIndexToProducts1771681814711 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE INDEX idx_product_id
            ON products(sku)
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_products_sku;
    `);
  }
}
