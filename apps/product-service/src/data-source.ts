import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/product-service/dotenv/.env' });
export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_DB_HOST,
  port: Number(process.env.POSTGRES_DB_PORT),
  username: process.env.POSTGRES_DB_USERNAME,
  password: process.env.POSTGRES_DB_PASSWORD,
  entities: ['apps/product-service/**/*.entity.ts'],
  synchronize: false,
  migrationsRun: false,
  database: process.env.POSTGRES_DB_NAME,
  migrations: ['apps/product-service/src/migrations/*.ts'],
});
