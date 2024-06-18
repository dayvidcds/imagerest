import { Module } from '@nestjs/common';
import { ImageGeneratorController } from './image-generator.controller';
import { ImageGeneratorService } from './image-generator.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register({ isGlobal: true, ttl: 60000 })],
  controllers: [ImageGeneratorController],
  providers: [ImageGeneratorService],
})
export class ImageGeneratorModule {}
