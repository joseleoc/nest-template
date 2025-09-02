import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  UseGuards,
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
import { SkipAuth } from '@/decorators/index';
import { handleError } from '@/utils';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @SkipAuth()
  @ApiOperation(SwaggerCreateUser)
  @ApiResponse(SwaggerCreateUserResponse)
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.usersService.create(createUserDto);
      res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      throw handleError(error);
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findUserById(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.usersService.findUserById(id);
      res.status(HttpStatus.OK).json(user);
    } catch (error) {
      throw handleError(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      res.status(HttpStatus.OK).json(user);
    } catch (error) {
      throw handleError(error);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.usersService.delete(id);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      throw handleError(error);
    }
  }
}
