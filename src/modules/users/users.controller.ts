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
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SkipAuth } from '@/decorators/index';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserDtoSchema } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserDtoSchema } from './dto/update-user.dto';
import { CreateUserResponse } from './users.constants';
import {
  ChangePasswordDto,
  ChangePasswordDtoSchema,
} from './dto/change-password.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  ForgotPasswordDto,
  ForgotPasswordDtoSchema,
} from './dto/forgot-password.dto';

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
  @UsePipes(new ZodValidationPipe(CreateUserDtoSchema))
  @ApiOperation(CreateUserResponse)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'When the user is created successfully',
  })
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
        if (error?.code != null) {
          res.status(error.code).json(error);
          return;
        }
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Finds a user by id',
    description: 'Returns a user with non-sensitive info',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the user is found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
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

  @Patch('/update')
  @UsePipes(new ZodValidationPipe(UpdateUserDtoSchema))
  @ApiOperation({
    summary: 'Updates an existing user',
    description:
      'Updates an existing user. cannot update the password, to change the password use the changePassword endpoint',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the user is updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiBearerAuth()
  update(@Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    try {
      this.usersService
        .update(updateUserDto.userId, updateUserDto)
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
  @ApiOperation({
    summary: 'Deletes an existing user',
    description:
      'Performs a lazy deletion to an user document, updating the "deleted" field to true, so it is treated as deleted element',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the user is deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
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
  @UsePipes(new ZodValidationPipe(ChangePasswordDtoSchema))
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Changes the password of a user',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
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

  @SkipAuth()
  @Post('/forgotPassword')
  @UsePipes(new ZodValidationPipe(ForgotPasswordDtoSchema))
  @ApiOperation({
    summary: 'Forgot password',
    description:
      'Sends a forgot password email to the user with the given email. If the user exists, it updates the password to the new one. This method should only be used when the user is verified to be owner of the account.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the user is updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  forgotPassword(@Body() body: ForgotPasswordDto, @Res() res: Response) {
    try {
      this.usersService
        .forgotPassword(body)
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
