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

  async login(user: User) {
    const payload = { name: user.name };

    const user = await this.usersService.getByName(user.name);
    if (user) {
      return user;
    }
    throw new UnauthorizedException('User not found');

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
