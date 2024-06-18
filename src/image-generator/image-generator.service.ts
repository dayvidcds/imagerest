import { Injectable } from '@nestjs/common';
import Jimp from 'jimp';

@Injectable()
export class ImageGeneratorService {
  public async generateImage(
    image: string | Buffer,
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

      const buffer = await jimpImage.getBufferAsync(Jimp.MIME_JPEG);

      return buffer;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      return null;
    }
  }
}
