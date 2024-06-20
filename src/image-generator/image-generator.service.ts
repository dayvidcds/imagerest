import { Injectable } from '@nestjs/common';
import { FormatEnum } from 'sharp';
const sharp = require('sharp');

@Injectable()
export class ImageGeneratorService {
  public async generateImage(
    image: string | Buffer,
    format: keyof FormatEnum,
    width?: number,
    height?: number,
    quality?: number,
    greyscale?: boolean,
  ): Promise<Buffer | null> {
    try {
      const sharpImage = sharp(image);

      const metadata = await sharpImage.metadata();

      const originalWidth = metadata.width ?? 0;
      const originalHeight = metadata.height ?? 0;

      const maxWidth = width ?? originalWidth;
      const maxHeight = height ?? originalHeight;
      const limiteMaximo = 2000;

      const finalWidth =
        maxWidth && maxWidth < originalWidth
          ? maxWidth
          : Math.min(originalWidth, limiteMaximo);
      const finalHeight =
        maxHeight && maxHeight < originalHeight
          ? maxHeight
          : Math.min(originalHeight, limiteMaximo);

      let processedImage = sharpImage.resize(finalWidth, finalHeight);

      if (greyscale) {
        processedImage = processedImage.greyscale();
      }

      if (quality) {
        processedImage = processedImage.toFormat(format, { quality });
      } else {
        processedImage = processedImage.toFormat(format);
      }

      const buffer = await processedImage.toBuffer();

      return buffer;
    } catch (error) {
      console.error('Error processing image', error);
      return null;
    }
  }
}
