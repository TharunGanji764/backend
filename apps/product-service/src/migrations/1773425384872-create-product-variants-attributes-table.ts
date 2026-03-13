import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductVariantsAttributesTable1773425384872 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product-variants-attributes"(
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "variant_id" uuid NOT NULL,
            "attribute_name" varchar NOT NULL,
            CONSTRAINT "PK_product_variant_attribute_id" PRIMARY KEY ("id"),
            CONSTRAINT "FK_product_variant_attribute_variant_id" FOREIGN KEY ("variant_id") REFERENCES "product-variants" ("id") ON DELETE CASCADE
            )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product-variants-attributes"`);
  }
}
