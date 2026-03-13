import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVariantsTable1773424858256 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` CREATE TYPE product_variant_status_enum AS ENUM ('active', 'inactive'); `,
    );
    await queryRunner.query(
      `CREATE TABLE "product-variants"
            (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "product_id" int NOT NULL,
                "sku" varchar NOT NULL,
                "price" numeric(10,2) NOT NULL,
                "stock" int NOT NULL,
                "status" product_variant_status_enum NOT NULL DEFAULT 'active',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_variant_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_product_variant_product_id" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE            
                )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product-variants"`);
    await queryRunner.query(`DROP TYPE product_variant_status_enum`);
  }
}
