import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  HttpException,
  Res,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SwaggerCreateUserResponse } from './users.constants';
import { SkipAuth } from '@/decorators/index';
import { Response } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @SkipAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse(SwaggerCreateUserResponse)
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const userCreated = await this.usersService.create(createUserDto);
      res.status(HttpStatus.CREATED).json({
        message: 'User created successfully',
        userId: userCreated.userId,
      });
      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.usersService.findOne(id);
      if (user != null) {
        res.status(HttpStatus.OK).json({ user });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error });
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
