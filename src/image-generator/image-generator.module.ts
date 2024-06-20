import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { ImageGeneratorController } from './image-generator.controller';
import { ImageGeneratorService } from './image-generator.service';
import { LocalStrategy } from 'src/local-strategy/local-strategy.service';

@Module({
  imports: [CacheModule.register({ isGlobal: true, ttl: 60000 })],
  controllers: [ImageGeneratorController],
  providers: [ImageGeneratorService, AwsS3Service, LocalStrategy],
  exports: [AwsS3Service, LocalStrategy],
})
export class ImageGeneratorModule {}
