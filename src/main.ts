import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet'; //  استيراد حماية الهيدرز
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule); 
  //  تفعيل حماية Helmet لرؤوس HTTP
  app.use(helmet());

  // 2. تفعيل CORS
  app.enableCors({
    origin: '*', // (تنبيه: عند الإنتاج النهائي يفضل تحديد النطاقات المسموحة بدقة بدلاً من النجمة)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // تفعيل نظام التحقق والتنقية العام (Validation Pipe)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // تجريد الكائن من أي حقول غير معرفة في الـ DTO
      forbidNonWhitelisted: true, // رفض الطلب تماماً إذا احتوى على حقول زائدة
      transform: true, 
    }),
  );

  // إعدادات Swagger
  const config = new DocumentBuilder()
    .setTitle('Smart Inventory & Sales API')
    .setDescription('Documentation for Smart Inventory & Sales Tracker Backend')
    .setVersion('1.0')
    .addBearerAuth() // لإضافة زر إدخال الـ Token واختبار المسارات المحمية
    .build();

    const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // ستجد التوثيق على الرابط /api

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
