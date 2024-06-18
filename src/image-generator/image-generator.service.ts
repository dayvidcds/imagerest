import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import Jimp from 'jimp';

@Injectable()
export class ImageGeneratorService {
  public async generateImage(
    image: string,
    width?: number,
    height?: number,
    quality?: number,
    greyscale?: boolean,
  ): Promise<Buffer | undefined> {
    const [fileName, fileType] = image.split('.');
    const fileBaseName = fileName.split('_')[0];

    const projectRoot = join(__dirname, '..', '..');
    const basePath = join(projectRoot, 'assets', `${fileBaseName}.${fileType}`);

    console.log(basePath);

    if (!existsSync(basePath)) {
      throw new ServiceUnavailableException('Recurso não disponível.');
    }

    const jimpImage = await Jimp.read(basePath.toString());

    const originalWidth = jimpImage.getWidth();
    const originalHeight = jimpImage.getHeight();

    let maxWidth = width ?? originalWidth;
    let maxHeight = height ?? Jimp.AUTO;

    if (width && width < originalWidth) {
      maxWidth = width;
    }

    if (height && height < originalHeight) {
      maxHeight = height;
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
  }
}
