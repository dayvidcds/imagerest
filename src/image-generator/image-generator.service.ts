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

    // Suba dois níveis a partir de __dirname para chegar ao diretório raiz do projeto
    const projectRoot = join(__dirname, '..', '..');
    const basePath = join(projectRoot, 'assets', `${fileBaseName}.${fileType}`);

    console.log(basePath);

    if (!existsSync(basePath)) {
      throw new ServiceUnavailableException('Recurso não disponível.');
    }

    const jimpImage = await Jimp.read(basePath.toString());

    // Obter as dimensões originais da imagem
    const originalWidth = jimpImage.getWidth();
    const originalHeight = jimpImage.getHeight();

    // Determinar a largura e altura máximas possíveis para redimensionar
    let maxWidth = width ?? Jimp.AUTO;
    let maxHeight = height ?? Jimp.AUTO;

    // Caso contrário, defina largura e altura máximas razoáveis com base nas dimensões originais
    // Exemplo: Limitar a largura e altura máximas a 2000 pixels
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

    // Aplicar redimensionamento com as largura e altura máximas calculadas
    jimpImage.resize(maxWidth, maxHeight);

    // Aplicar greyscale se solicitado
    if (greyscale) {
      jimpImage.greyscale();
    }

    // Aplicar qualidade se fornecida
    if (quality) {
      jimpImage.quality(quality);
    }

    const buffer = await jimpImage.getBufferAsync(Jimp.MIME_JPEG);

    return buffer;
  }
}
