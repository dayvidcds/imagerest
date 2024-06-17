import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<User> {
    return this.usersService.getById(id);
  }

  @Post()
  save(@Body() user: User) {
    return this.usersService.create(user);
  }
}
