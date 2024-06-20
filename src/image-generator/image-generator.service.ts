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

      let finalWidth = width ?? originalWidth;
      let finalHeight = height ?? originalHeight;

      const maxLimit = Math.max(originalWidth, originalHeight);

      if (!width && height) {
        finalWidth = Math.round((height / originalHeight) * originalWidth);
      } else if (width && !height) {
        finalHeight = Math.round((width / originalWidth) * originalHeight);
      }

      finalWidth = Math.min(finalWidth, maxLimit);
      finalHeight = Math.min(finalHeight, maxLimit);

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
      return null;
    }
  }
}
