import { Injectable } from '@nestjs/common';
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
      console.error(
        `Erro ao obter objeto ${key} do bucket ${bucketName}: ${err}`,
      );
      throw err;
    }
  }
}
