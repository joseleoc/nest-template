import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  SwaggerCreateUser,
  SwaggerCreateUserResponse,
} from './users.constants';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation(SwaggerCreateUser)
  @ApiResponse(SwaggerCreateUserResponse)
  create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    // try {
    //   return this.usersService.create(createUserDto);
    // } catch (error) {
    //   throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    // }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: Response) {
    this.usersService
      .findOne(id)
      .then((user) => {
        if (user != null) {
          res.status(HttpStatus.OK).json(user);
        } else {
          res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
      })
      .catch((error) => {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
