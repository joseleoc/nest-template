import { Response } from 'express';
import {
  Controller,
  Get,
  Patch,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
  Body,
  BadRequestException,
  Logger,
  UsePipes,
  Post,
} from '@nestjs/common';
import { NarratorsService } from './narrators.service';

import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import {
  UpdateNarratorDto,
  UpdateNarratorDtoSchema,
} from './dto/update-narrator.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  FindOneNarratorDto,
  FindOneNarratorDtoSchema,
} from './dto/find-one-narrator.dto';

@ApiTags('Narrators')
@Controller('narrators')
export class NarratorsController {
  logger = new Logger(NarratorsController.name);
  constructor(private readonly narratorsService: NarratorsService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieves all narrators',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description:
      'Internal server error, could be caused by a database error, such as a duplicated narrator name or voiceId',
  })
  findAll(@Res() res: Response) {
    try {
      this.narratorsService
        .findAll()
        .then((narrators) => {
          res.status(HttpStatus.OK).json(narrators);
        })
        .catch((error) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
    }
  }

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieves a single narrator by a given id.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description:
      'Internal server error, could be caused by a database error, such as a duplicated narrator name or voiceId',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Narrator not found',
  })
  findOneById(@Param('id') id: string, @Res() res: Response) {
    try {
      this.narratorsService
        .findOneById(id)
        .then((narrator) => {
          if (narrator != null) {
            res.status(HttpStatus.OK).json(narrator);
          } else {
            throw new NotFoundException();
          }
        })
        .catch((error) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
    }
  }

  @Patch()
  @ApiOperation({
    summary: 'Updates a narrator document',
    description:
      'Updates a narrator document. The id is required and must be a valid ObjectId. This method is intended to be used only by the admin role as an internal endpoint.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad request, id is required and must be a valid ObjectId or any other validation error, check the error message for more details.',
  })
  @ApiOkResponse({
    description:
      'Narrator document updated successfully, returns the updated narrator document.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error could be caused by a database error.',
  })
  @UsePipes(new ZodValidationPipe(UpdateNarratorDtoSchema))
  updateNarrator(@Body() body: UpdateNarratorDto, @Res() res: Response) {
    if (body.id == null) {
      throw new BadRequestException('id is required');
    }
    const isValid = ObjectId.isValid(body.id);
    if (!isValid) {
      throw new BadRequestException('id is not a valid ObjectId');
    }
    this.narratorsService
      .updateNarrator(body)
      .then((narrator) => {
        if (narrator == null) {
          throw new NotFoundException('narrator not found');
        }
        res.status(HttpStatus.OK).json(narrator);
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

  @Post('findOne')
  @ApiOperation({
    summary: 'Finds a narrator by a given name',
    description:
      'Finds a narrator by a given name. This method is intended to be used only by the admin role as an internal endpoint.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad request, name is required and must be a string or any other validation error, check the error message for more details.',
  })
  @ApiOkResponse({
    description: 'Narrator found successfully, returns the narrator document.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error could be caused by a database error.',
  })
  @UsePipes(new ZodValidationPipe(FindOneNarratorDtoSchema))
  findOneByName(@Body() body: FindOneNarratorDto, @Res() res: Response) {
    this.narratorsService
      .findOne(body)
      .then((narrator) => {
        if (narrator == null) {
          throw new NotFoundException('narrator not found');
        }
        res.status(HttpStatus.OK).json(narrator);
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
}
