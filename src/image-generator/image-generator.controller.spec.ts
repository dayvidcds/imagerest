import { Test, TestingModule } from '@nestjs/testing';
import { ImageGeneratorController } from './image-generator.controller';
import { ImageGeneratorService } from './image-generator.service';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { LocalStrategy } from '../local-strategy/local-strategy.service';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TypeAcceptedFormat } from 'src/types/global.types';

describe('ImageGeneratorController', () => {
  let controller: ImageGeneratorController;
  let cacheManager: Cache;
  let awsS3Service: AwsS3Service;
  let imageGeneratorService: ImageGeneratorService;

  const userId = '6674dd3cd6cdcbdf4c4e7d5a';
  const image = 'praia.jpg';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageGeneratorController],
      providers: [
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: AwsS3Service,
          useFactory: () => ({
            getObject: jest.fn(),
          }),
        },
        {
          provide: ImageGeneratorService,
          useFactory: () => ({
            generateImage: jest.fn(),
          }),
        },
        {
          provide: LocalStrategy,
          useFactory: () => ({
            getImageLocation: jest.fn(),
          }),
        },
      ],
    }).compile();

    controller = module.get<ImageGeneratorController>(ImageGeneratorController);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
    imageGeneratorService = module.get<ImageGeneratorService>(
      ImageGeneratorService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getImage', () => {
    const mockResponse = (): Response =>
      ({
        setHeader: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      }) as any;

    it('should return cached image if available', async () => {
      const width = '';
      const height = '';
      const quality = '';
      const greyscale = '';
      const format = 'jpg';
      const cacheKey = `image-${userId}-${image}-${width}-${height}-${quality}-${greyscale}-${format}`;
      const cachedData = Buffer.from('cached image data');

      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedData);

      const res = mockResponse();
      await controller.getImage(
        userId,
        image,
        quality,
        format,
        width,
        height,
        greyscale,
        res,
      );

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpg');
      expect(res.send).toHaveBeenCalledWith(cachedData);
    });

    it('should throw NotFoundException if image processing fails', async () => {
      const width = '';
      const height = '';
      const quality = '';
      const greyscale = '';
      const format = 'jpg';
      const cacheKey = `image-${userId}-${image}-${width}-${height}-${quality}-${greyscale}-${format}`;
      const s3Object = { Body: Buffer.from('s3 image data') };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(awsS3Service, 'getObject').mockResolvedValue(s3Object);
      jest
        .spyOn(imageGeneratorService, 'generateImage')
        .mockResolvedValue(null);

      const res = mockResponse();
      await expect(
        controller.getImage(
          userId,
          image,
          quality,
          format,
          width,
          height,
          greyscale,
          res,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(awsS3Service.getObject).toHaveBeenCalledWith(
        process.env.AWS_BUCKET_NAME,
        `${userId}/${image}`,
      );
      expect(imageGeneratorService.generateImage).toHaveBeenCalledWith(
        s3Object.Body,
        'jpg',
        undefined,
        undefined,
        parseInt(process.env.DEFAULT_IMAGE_QUALITY, 10),
        false,
      );
    });

    it('should fetch image from S3 and process it if not cached', async () => {
      const width = '';
      const height = '';
      const quality = '';
      const greyscale = '';
      const format = 'jpg';
      const cacheKey = `image-${userId}-${image}-${width}-${height}-${quality}-${greyscale}-${format}`;
      const s3Object = { Body: Buffer.from('s3 image data') };
      const processedBuffer = Buffer.from('processed image data');

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(awsS3Service, 'getObject').mockResolvedValue(s3Object);
      jest
        .spyOn(imageGeneratorService, 'generateImage')
        .mockResolvedValue(processedBuffer);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

      const res = mockResponse();
      await controller.getImage(
        userId,
        image,
        quality,
        format,
        width,
        height,
        greyscale,
        res,
      );

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(awsS3Service.getObject).toHaveBeenCalledWith(
        process.env.AWS_BUCKET_NAME,
        `${userId}/${image}`,
      );
      expect(imageGeneratorService.generateImage).toHaveBeenCalledWith(
        s3Object.Body,
        'jpg',
        undefined,
        undefined,
        parseInt(process.env.DEFAULT_IMAGE_QUALITY, 10),
        false,
      );
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, processedBuffer);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpg');
      expect(res.send).toHaveBeenCalledWith(processedBuffer);
    });

    it('should throw NotFoundException if image processing fails', async () => {
      const width = '';
      const height = '';
      const quality = '';
      const greyscale = '';
      const format = 'jpg';
      const cacheKey = `image-${userId}-${image}-${width}-${height}-${quality}-${greyscale}-${format}`;
      const s3Object = { Body: Buffer.from('s3 image data') };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(awsS3Service, 'getObject').mockResolvedValue(s3Object);
      jest
        .spyOn(imageGeneratorService, 'generateImage')
        .mockResolvedValue(null);

      const res = mockResponse();
      await expect(
        controller.getImage(
          userId,
          image,
          quality,
          format,
          width,
          height,
          greyscale,
          res,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(awsS3Service.getObject).toHaveBeenCalledWith(
        process.env.AWS_BUCKET_NAME,
        `${userId}/${image}`,
      );
    });

    it('should handle errors gracefully', async () => {
      const width = '';
      const height = '';
      const quality = '';
      const greyscale = '';
      const format = 'jpg';
      const cacheKey = `image-${userId}-${image}-${width}-${height}-${quality}-${greyscale}-${format}`;
      const s3Object = { Body: Buffer.from('s3 image data') };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(awsS3Service, 'getObject').mockResolvedValue(s3Object);
      jest
        .spyOn(imageGeneratorService, 'generateImage')
        .mockResolvedValue(null);

      const res = mockResponse();
      await expect(
        controller.getImage(
          userId,
          image,
          quality,
          format,
          width,
          height,
          greyscale,
          res,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(awsS3Service.getObject).toHaveBeenCalledWith(
        process.env.AWS_BUCKET_NAME,
        `${userId}/${image}`,
      );
    });
  });
});
