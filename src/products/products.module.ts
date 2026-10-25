import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller'; // تأكد من الاستيراد
import { Product } from './entities/product.entity';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoriesModule,
  ],
  controllers: [ProductsController], // تأكد من وجوده هنا تماماً
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}