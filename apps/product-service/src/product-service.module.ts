import { Module } from '@nestjs/common';
import { ProductServiceController } from './product-service.controller';
import { ProductServiceService } from './product-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from '../schemas/products.entity';
import { ProductDimensions } from '../schemas/product-dimensions.entity';
import { ProductImages } from '../schemas/product-images.entity';
import { ProductMeta } from '../schemas/product-meta.entity';
import { ProductReviews } from '../schemas/product-reviews.entity';
import { ProductTags } from '../schemas/product-tags.entity';
import { ProductSearch } from '../schemas/product-search.entity';
import { WishListEntity } from '../schemas/wishList.entity';
import { ProductVariants } from '../schemas/product-variants.entity';
import { ProductVariantsAttributes } from '../schemas/product-variant-attributes.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/product-service/dotenv/.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_DB_HOST'),
        port: Number(config.get('POSTGRES_DB_PORT')),
        username: config.get('POSTGRES_DB_USERNAME'),
        password: config.get('POSTGRES_DB_PASSWORD'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: false,
        database: config.get('POSTGRES_DB_NAME'),
      }),
    }),
    TypeOrmModule.forFeature([
      Products,
      ProductDimensions,
      ProductImages,
      ProductMeta,
      ProductReviews,
      ProductTags,
      ProductSearch,
      WishListEntity,
      ProductVariants,
      ProductVariantsAttributes,
    ]),
  ],
  controllers: [ProductServiceController],
  providers: [ProductServiceService],
})
export class ProductServiceModule {}
