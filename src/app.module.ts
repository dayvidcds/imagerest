import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { RedisClientOptions } from 'redis';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ImageGeneratorService } from './image-generator/image-generator.service';
import { ImageGeneratorController } from './image-generator/image-generator.controller';
import { ImageGeneratorModule } from './image-generator/image-generator.module';
import { RedisService } from './redis/redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ limit: 10, ttl: 60000 }]),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
      auth: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
      },
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      host: 'local:redis',
      port: 6379,
    }),
    UserModule,
    AuthModule,
    ImageGeneratorModule,
  ],
  controllers: [AppController, ImageGeneratorController],
  providers: [AppService, ImageGeneratorService, RedisService],
})
export class AppModule {}
