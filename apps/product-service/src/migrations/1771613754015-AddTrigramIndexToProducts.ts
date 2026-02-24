import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrigramIndexToProducts1771613754015 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_search(
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id text UNIQUE NOT NULL,
      product_name text NOT NULL,
      category text NOT NULL,
      price numeric NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
      )
  `);
    await queryRunner.query(`
    CREATE INDEX search_index ON product_search USING GIN (product_name gin_trgm_ops)
    `);

    await queryRunner.query(`
      CREATE INDEX search_price ON product_search(price)
      `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP INDEX IF EXISTS search_index`);
  }
}
