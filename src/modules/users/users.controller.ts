import { Response } from 'express';
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
  NotFoundException,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { SkipAuth } from '@/decorators/index';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserResponse } from './users.constants';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @SkipAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse(CreateUserResponse)
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const userCreated = await this.usersService.create(createUserDto);
      res.status(HttpStatus.CREATED).json({
        message: 'User created successfully',
        user: userCreated,
      });
      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiResponse({
    description: `Retrieves an existing use's non sensitive info `,
  })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    this.usersService
      .findOne(id)
      .then((user) => {
        if (user != null) {
          res.status(HttpStatus.OK).json({ user });
        } else {
          throw new NotFoundException();
        }
      })
      .catch((error) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }

  @Patch(':id')
  @ApiResponse({ description: 'Updates an existing user' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      this.usersService
        .update(id, updateUserDto)
        .then((user) => {
          if (user != null) {
            res.status(HttpStatus.OK).json(user);
          } else {
            throw new NotFoundException();
          }
        })
        .catch((error) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiResponse({
    description:
      'Performs a lazy deletion to an user document, updating the "deleted" field to true, so it is treated as deleted element',
  })
  remove(@Param('id') id: string, @Res() res: Response) {
    try {
      this.usersService
        .remove(id)
        .then((deleted) => {
          if (deleted != null) {
            res.status(HttpStatus.OK).json(deleted);
          } else {
            throw new NotFoundException();
          }
        })
        .catch((error) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
