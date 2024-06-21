import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class LocalStrategy {
  public async getImageLocation(imagePath: string): Promise<string> {
    try {
      const projectRoot = join(__dirname, '..', '..');
      const basePath = join(projectRoot, 'assets', imagePath);

      if (!existsSync(basePath)) {
        throw new NotFoundException();
      }
      return basePath;
    } catch (err) {
      throw err;
    }
  }
}
