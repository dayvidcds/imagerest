import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { ImageGeneratorService } from './image-generator.service';
import { Response } from 'express';

@Controller('image-generator')
export class ImageGeneratorController {
  constructor(private readonly imageGeneratorService: ImageGeneratorService) {}

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

    try {
      const buffer = await this.imageGeneratorService.generateImage(
        image,
        widthNumber,
        heightNumber,
        qualityNumber,
        greyscaleBool,
      );

      if (!buffer) {
        throw new NotFoundException();
      }

      // Define o tipo de conteúdo da resposta como imagem JPEG
      res.setHeader('Content-Type', 'image/jpeg');
      // Envia o buffer como resposta
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
