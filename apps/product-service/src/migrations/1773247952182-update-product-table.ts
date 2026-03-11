import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductTable1773247952182 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE products ADD COLUMN full_description TEXT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE products DROP COLUMN full_description`,
    );
  }
}
