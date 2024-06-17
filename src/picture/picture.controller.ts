import { Controller, Get } from '@nestjs/common';
import { PictureService } from './picture.service';

@Controller('picture')
export class PictureController {
  constructor(private readonly pictureService: PictureService) {}

  @Get()
  getHello(): string {
    return 'Picture route';
  }
}
