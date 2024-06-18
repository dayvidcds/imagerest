import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ImageGeneratorService } from './image-generator/image-generator.service';
import { ImageGeneratorController } from './image-generator/image-generator.controller';
import { ImageGeneratorModule } from './image-generator/image-generator.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ limit: 10, ttl: 60 }]),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
      auth: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
      },
    }),
    UserModule,
    AuthModule,
    ImageGeneratorModule,
  ],
  controllers: [AppController, ImageGeneratorController],
  providers: [AppService, ImageGeneratorService],
})
export class AppModule {}
