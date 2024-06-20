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
import { existsSync } from 'fs';
import { join } from 'path';
import { ImageGeneratorService } from './image-generator.service';
import { TypeAcceptedFormat } from 'types/global.types';
import { FormatEnum } from 'sharp';

@Controller('image-generator')
export class ImageGeneratorController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly imageGeneratorService: ImageGeneratorService,
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

    let finalFormat: keyof FormatEnum = format ?? 'jpg';

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
    const pGreyscale = greyscale === '0';

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
      const projectRoot = join(__dirname, '..', '..', '..');
      const basePath = join(
        projectRoot,
        'assets',
        `${fileBaseName}.${fileType}`,
      );

      if (!existsSync(basePath)) {
        throw new NotFoundException();
      }

      const buffer = await this.imageGeneratorService.generateImage(
        basePath,
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
