import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); 
  // تفعيل نظام التحقق والتنقية العام (Validation Pipe)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // تجريد الكائن من أي حقول غير معرفة في الـ DTO
      forbidNonWhitelisted: true, // رفض الطلب تماماً إذا احتوى على حقول زائدة
      transform: true, 
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
