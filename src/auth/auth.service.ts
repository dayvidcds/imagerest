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

  async validateUser(username: string, email: string): Promise<any> {
    const user = await this.usersService.getByName(username);
    if (user && user.email === email) {
      const { email, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('User not found')
  }

  async login(user: User) {
    const payload = { name: user.name, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
