import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async getAll() {
    return await this.userModel.find().exec();
  }

  async getById(id: string) {
    return await this.userModel.findById(id).exec();
  }

  async getByName(name: string) {
    return await this.userModel.findOne({ name }).exec();
  }

  async create(user: { name: string; email: string }) {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
