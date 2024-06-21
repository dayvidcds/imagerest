import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async findUserByName(username: string): Promise<User> {
    const user = await this.usersService.getByName(username);
    if (user) {
      return user;
    }
    throw new UnauthorizedException('User not found');
  }

  async login(username: string): Promise<any> {
    const findedUser = await this.usersService.getByName(username);
    if (findedUser) {
      return {
        newUser: false,
        access_token: this.jwtService.sign({ name: username }),
      };
    }
    const createtedUser = await this.usersService.create({ name: username });
    return {
      newUser: true,
      access_token: this.jwtService.sign({ name: createtedUser.name }),
    };
  }
}
