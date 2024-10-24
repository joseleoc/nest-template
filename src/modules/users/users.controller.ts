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
  HttpException,
  Res,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SkipAuth } from '@/decorators/index';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserResponse } from './users.constants';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(UsersController.name);
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(private readonly usersService: UsersService) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------

  @SkipAuth()
  @Post('/create')
  @ApiResponse(CreateUserResponse)
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description:
      'Internal server error, could be caused by a database error, such as a duplicated userName or email',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plan not found',
  })
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    this.usersService
      .create(createUserDto)
      .then((userCreated) => {
        res.status(HttpStatus.CREATED).json({
          message: 'User created successfully',
          user: userCreated,
        });
      })
      .catch((error) => {
        this.logger.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({
    description: `Retrieves an existing use's non sensitive info `,
  })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    this.usersService
      .findOneById(id)
      .then((user) => {
        if (user != null) {
          res.status(HttpStatus.OK).json({ user });
        } else {
          throw new NotFoundException();
        }
      })
      .catch((error) => {
        this.logger.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiResponse({
    description:
      'Updates an existing user. cannot update the password, to change the password use the changePassword endpoint',
  })
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
          this.logger.error(error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      this.logger.error(error);

      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
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
          this.logger.error(error);

          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      this.logger.error(error);

      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @SkipAuth()
  @Post('/changePassword')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Changes the password of a user',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description:
      'Internal server error, could be caused by a database error, such as a duplicated userName or email',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User password is wrong',
  })
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ) {
    try {
      this.usersService
        .changePassword({
          oldPassword: changePasswordDto.password,
          newPassword: changePasswordDto.newPassword,
          userEmail: changePasswordDto.email,
        })
        .then((user) => {
          if (user != null) {
            res.status(HttpStatus.OK).json(user);
          } else {
            throw new NotFoundException();
          }
        })
        .catch((error) => {
          this.logger.error(error);
          if (error && error.code) {
            res.status(error.code).json(error);
            return;
          }
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
