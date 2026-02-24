import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductUserIdToWishlist1771685282168 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wishlist"
      ADD COLUMN "user_id" uuid NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wishlist"
      DROP COLUMN "user_id"
    `);
  }
}
