import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './caegories/catigories.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000, // المدة بالميلي ثانية (60 ثانية)
      limit: 10,  // عدد الطلبات المسموحة في هذه المدة
    }]),


    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true, // تحميل الكيانات تلقائياً أينما وجدت
        synchronize: true,      // يقوم بإنشاء وتحديث الجداول تلقائياً في قاعدة البيانات (يُعطل في الإنتاج الفعلي)
      }),
    }),
    UsersModule,
    CategoriesModule,
    ProductsModule,
    SalesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide:APP_GUARD,
      useClass:ThrottlerGuard,
  }]
  
})
export class AppModule {}
