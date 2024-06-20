import { Test, TestingModule } from '@nestjs/testing';
import { ImageGeneratorController } from './image-generator.controller';
import { ImageGeneratorService } from './image-generator.service';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { LocalStrategy } from '../local-strategy/local-strategy.service';
import { NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { TypeAcceptedFormat } from 'src/types/global.types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('ImageGeneratorController', () => {
  let controller: ImageGeneratorController;
  let cacheManager: Cache;
  let awsS3Service: AwsS3Service;
  let imageGeneratorService: ImageGeneratorService;
  let localStrategyService: LocalStrategy;

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
          useValue: {
            getObject: jest.fn(),
          },
        },
        {
          provide: ImageGeneratorService,
          useValue: {
            generateImage: jest.fn(),
          },
        },
        {
          provide: LocalStrategy,
          useValue: {
            getImageLocation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImageGeneratorController>(ImageGeneratorController);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
    imageGeneratorService = module.get<ImageGeneratorService>(
      ImageGeneratorService,
    );
    localStrategyService = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getImage', () => {
    const mockResponse = (): Response => {
      const res = {} as Response;
      res.setHeader = jest.fn().mockReturnValue(res);
      res.send = jest.fn().mockReturnValue(res);
      return res;
    };

    it('should return cached image if available', async () => {
      const image = 'test.jpg';
      const width = '';
      const height = '';
      const quality = '';
      const greyscale = '';
      const format = 'jpg';
      const cacheKey = `image-${image}-${width}-${height}-${quality}-${greyscale}-${format}`;
      const cachedData = Buffer.from('cached image data');

      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedData);

      const res = mockResponse();
      await controller.getImage(
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

    it('should throw NotFoundException for unsupported image format', async () => {
      const image = 'test.jpg';
      const res = mockResponse();

      const invalidFormat = 'gif' as TypeAcceptedFormat;

      await expect(
        controller.getImage(image, '', invalidFormat, '', '', '', res),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fetch image from S3 and process it if not cached', async () => {
      const image = 'test.jpg';
      const width = '';
      const height = '';
      const quality = '';
      const greyscale = '';
      const format = 'jpg';
      const cacheKey = `image-${image}-${width}-${height}-${quality}-${greyscale}-${format}`;
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
        'test.jpg',
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
      const image = 'test.jpg';
      const width = '';
      const height = '';
      const quality = '';
      const greyscale = '';
      const format = 'jpg';
      const cacheKey = `image-${image}-${width}-${height}-${quality}-${greyscale}-${format}`;
      const s3Object = { Body: Buffer.from('s3 image data') };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(awsS3Service, 'getObject').mockResolvedValue(s3Object);
      jest
        .spyOn(imageGeneratorService, 'generateImage')
        .mockResolvedValue(null);

      const res = mockResponse();
      await expect(
        controller.getImage(
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
        'test.jpg',
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

    it('should handle errors gracefully', async () => {
      const image = 'test.jpg';
      const width = '';
      const height = '';
      const quality = '';
      const greyscale = '';
      const format = 'jpg';
      const cacheKey = `image-${image}-${width}-${height}-${quality}-${greyscale}-${format}`;

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest
        .spyOn(awsS3Service, 'getObject')
        .mockRejectedValue(new Error('S3 error'));

      const res = mockResponse();
      await expect(
        controller.getImage(
          image,
          quality,
          format,
          width,
          height,
          greyscale,
          res,
        ),
      ).rejects.toThrow('Error processing image');

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(awsS3Service.getObject).toHaveBeenCalledWith(
        process.env.AWS_BUCKET_NAME,
        'test.jpg',
      );
    });
  });
});
