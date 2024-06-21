import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import * as multer from 'multer';
import { FormatEnum } from 'sharp';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { TypeAcceptedFormat } from 'src/types/global.types';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { LocalStrategy } from '../local-strategy/local-strategy.service';
import { ImageGeneratorService } from './image-generator.service';

@Controller('image-generator')
export class ImageGeneratorController {
  private readonly bucketName = process.env.AWS_BUCKET_NAME;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly imageGeneratorService: ImageGeneratorService,
    private readonly awsS3Service: AwsS3Service,
    private readonly localStrategyService: LocalStrategy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('images/:image')
  public async getImage(
    @UserId() userId: string,
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

    console.log(userId);

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

    const cacheKey = `image-${userId}-${image}-${width}-${height}-${quality}-${greyscale}-${finalFormat || originalFormat}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      res.setHeader('Content-Type', `image/${finalFormat ?? originalFormat}`);
      res.send(cachedData);
      return;
    }

    try {
      const bucketName = process.env.AWS_BUCKET_NAME;
      const key = `${userId}/${fileBaseName}.${fileType}`;

      const s3Object = await this.awsS3Service.getObject(bucketName, key);

      const buffer = await this.imageGeneratorService.generateImage(
        s3Object.Body,
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

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  public async uploadImage(
    @UploadedFile() file: any,
    @UserId() userId: string,
  ) {
    if (!file) {
      throw new NotFoundException('File not provided');
    }

    const key = `${userId}/${file.originalname}`;
    const contentType = file.mimetype;

    try {
      const uploadResult = await this.awsS3Service.uploadObject(
        this.bucketName,
        key,
        file.buffer,
        contentType,
      );

      return {
        message: 'File uploaded successfully',
        url: key,
        data: uploadResult,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  public async listFiles(@UserId() userId: string) {
    try {
      const listResult = await this.awsS3Service.listFiles(
        this.bucketName,
        userId,
      );

      return {
        message: 'Your pictures',
        data: listResult,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
