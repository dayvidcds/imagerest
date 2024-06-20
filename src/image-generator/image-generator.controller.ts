import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { FormatEnum } from 'sharp';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { TypeAcceptedFormat } from 'src/types/global.types';
import { ImageGeneratorService } from './image-generator.service';
import { LocalStrategy } from 'src/local-strategy/local-strategy.service';

@Controller('image-generator')
export class ImageGeneratorController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly imageGeneratorService: ImageGeneratorService,
    private readonly awsS3Service: AwsS3Service,
    private readonly localStrategyService: LocalStrategy,
  ) {}

  @Get('images/:image')
  public async getImage(
    @Param('image') image: string,
    @Query('q') quality: string,
    @Query('fm') format: TypeAcceptedFormat,
    @Query('w') width: string,
    @Query('h') height: string,
    @Query('gray') greyscale: string,
    @Res() res: Response,
  ) {
    const allowedFormats: Array<TypeAcceptedFormat> = [
      'jpg',
      'jpeg',
      'png',
      'webp',
    ];

    const finalFormat: keyof FormatEnum = format ?? 'jpg';

    if (format && !allowedFormats.includes(format)) {
      throw new NotFoundException(
        'Unsupported image format. Use jpg, png or webp',
      );
    }

    const pWidth = width ? parseInt(width, 10) : undefined;
    const pHeight = height ? parseInt(height, 10) : undefined;
    const pQuality = quality
      ? parseInt(quality, 10)
      : parseInt(process.env.DEFAULT_IMAGE_QUALITY, 10);
    const pGreyscale = greyscale === '1';

    const [fileName, fileType] = image.split('.');
    const fileBaseName = fileName.split('_')[0];
    const originalFormat = fileType.toLowerCase();

    const cacheKey = `image-${image}-${width}-${height}-${quality}-${greyscale}-${finalFormat || originalFormat}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      res.setHeader('Content-Type', `image/${finalFormat ?? originalFormat}`);
      res.send(cachedData);
      return;
    }

    try {
      const bucketName = process.env.AWS_BUCKET_NAME;
      const key = `${fileBaseName}.${fileType}`;

      //const s3Object = await this.awsS3Service.getObject(bucketName, key);
      const imagePath = await this.localStrategyService.getImageLocation(key);

      const buffer = await this.imageGeneratorService.generateImage(
        imagePath,
        finalFormat,
        pWidth,
        pHeight,
        pQuality,
        pGreyscale,
      );

      if (!buffer) {
        throw new NotFoundException();
      }

      await this.cacheManager.set(cacheKey, buffer);

      res.setHeader('Content-Type', `image/${finalFormat ?? originalFormat}`);
      res.send(buffer);
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Image not found');
      } else {
        throw new Error('Error processing image');
      }
    }
  }
}
