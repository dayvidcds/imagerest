import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsS3Service {
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_KEY_ID,
      secretAccessKey: process.env.AWS_ACCESS_KEY,
      region: process.env.AWS_BUCKET_REGION,
    });
  }

  async getObject(
    bucketName: string,
    key: string,
  ): Promise<AWS.S3.GetObjectOutput> {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      const data = await this.s3.getObject(params).promise();
      return data;
    } catch (err) {
      throw new NotFoundException();
    }
  }

  async uploadObject(
    bucketName: string,
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    contentType: string,
  ): Promise<AWS.S3.PutObjectOutput> {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    };

    try {
      const data = await this.s3.putObject(params).promise();
      return data;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async listFiles(
    bucketName: string,
    userId: string,
  ): Promise<AWS.S3.ObjectList> {
    const params = {
      Bucket: bucketName,
      Prefix: `${userId}/`,
    };

    try {
      const data = await this.s3.listObjectsV2(params).promise();
      return data.Contents;
    } catch (err) {
      throw new NotFoundException(`Folder with userId '${userId}' not found`);
    }
  }
}
