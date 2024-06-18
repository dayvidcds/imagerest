import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ImageGeneratorService } from './image-generator.service';
import { Response } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('image-generator')
export class ImageGeneratorController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly imageGeneratorService: ImageGeneratorService,
  ) {}

  @Get('images/:image')
  public async getImage(
    @Param('image') image: string,
    @Query('width') width: string,
    @Query('height') height: string,
    @Query('quality') quality: string,
    @Query('greyscale') greyscale: string,
    @Res() res: Response,
  ) {
    const widthNumber = width ? parseInt(width, 10) : undefined;
    const heightNumber = height ? parseInt(height, 10) : undefined;
    const qualityNumber = quality ? parseInt(quality, 10) : 85;
    const greyscaleBool = greyscale === 'true';

    const cacheKey = `image-${image}-${width}-${height}-${quality}-${greyscale}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(cachedData);
      return;
    }

    try {
      const [fileName, fileType] = image.split('.');
      const fileBaseName = fileName.split('_')[0];

      const projectRoot = join(__dirname, '..', '..');
      const basePath = join(
        projectRoot,
        'assets',
        `${fileBaseName}.${fileType}`,
      );

      if (!existsSync(basePath)) {
        return null;
      }

      const buffer = await this.imageGeneratorService.generateImage(
        basePath,
        widthNumber,
        heightNumber,
        qualityNumber,
        greyscaleBool,
      );

      if (!buffer) {
        throw new NotFoundException();
      }
      await this.cacheManager.set(cacheKey, buffer);

      res.setHeader('Content-Type', 'image/jpeg');
      res.send(buffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Imagem não encontrada');
      } else {
        throw new Error('Erro ao processar imagem');
      }
    }
  }
}
