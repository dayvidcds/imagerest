import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.listen(process.env?.PORT || 3000);
  Logger.log(`Application is running on: ${await app.getUrl()}`, 'Main');
}

bootstrap().catch((err) => Logger.error(err));
