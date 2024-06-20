import { Controller, Get, Body, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/auth.guard';
import { User } from './users/user';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Body() body: User) {
    return this.authService.validateUser(body.name, body.email);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
