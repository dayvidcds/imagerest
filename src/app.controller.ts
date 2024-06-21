import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { User } from './users/user';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Post('auth/login')
  async login(@Body() body: User) {
    return this.authService.login(body.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
