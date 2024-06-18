import { Injectable } from '@nestjs/common';
import Jimp from 'jimp';

@Injectable()
export class ImageGeneratorService {
  public async generateImage(
    image: string | Buffer,
    format: string,
    width?: number,
    height?: number,
    quality?: number,
    greyscale?: boolean,
  ): Promise<Buffer | null> {
    try {
      const jimpImage = await Jimp.read(image.toString());

      const originalWidth = jimpImage.getWidth();
      const originalHeight = jimpImage.getHeight();

      let maxWidth = width ?? Jimp.AUTO;
      let maxHeight = height ?? Jimp.AUTO;

      const limiteMaximo = 2000;
      if (width && width < originalWidth) {
        maxWidth = width;
      } else if (originalWidth > limiteMaximo) {
        maxWidth = limiteMaximo;
      }

      if (height && height < originalHeight) {
        maxHeight = height;
      } else if (originalHeight > limiteMaximo) {
        maxHeight = limiteMaximo;
      }

      jimpImage.resize(maxWidth, maxHeight);

      if (greyscale) {
        jimpImage.greyscale();
      }

      if (quality) {
        jimpImage.quality(quality);
      }

      const formatMap = {
        jpeg: Jimp.MIME_JPEG,
        jpg: Jimp.MIME_JPEG,
        png: Jimp.MIME_PNG,
        webp: Jimp.MIME_BMP,
      };

      if (!formatMap[format.toLowerCase()]) {
        throw new Error('Unsupported image format. Use jpeg, png or webp');
      }

      const mime = formatMap[format.toLowerCase()];

      const buffer = await jimpImage.getBufferAsync(mime);

      return buffer;
    } catch (error) {
      console.error('Error processing image', error);
      return null;
    }
  }
}
