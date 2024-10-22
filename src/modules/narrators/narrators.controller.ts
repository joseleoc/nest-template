import { Response } from 'express';
import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { NarratorsService } from './narrators.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Narrators')
@Controller('narrators')
export class NarratorsController {
  constructor(private readonly narratorsService: NarratorsService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieves all narrators',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description:
      'Internal server error, could be caused by a database error, such as a duplicated narrator name or voiceId',
  })
  @Get()
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
  @Get(':id')
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
}
