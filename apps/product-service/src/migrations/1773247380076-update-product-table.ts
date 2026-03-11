import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductTable1773247380076 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE products
       ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active',
       ADD COLUMN seller_id VARCHAR(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE products
       DROP COLUMN status,
       DROP COLUMN seller_id`,
    );
  }
}
