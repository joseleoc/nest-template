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
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Children')
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  create(@Body() createChildDto: CreateChildDto, @Res() res: Response) {
    try {
      this.childrenService
        .create(createChildDto)
        .then((child) => {
          res.status(HttpStatus.CREATED).json({
            message: 'Child created successfully',
            child,
          });
        })
        .catch((error) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/byParentId/:parentId')
  findByParentId(@Param('parentId') parentId: string, @Res() res: Response) {
    try {
      this.childrenService
        .findAllByParentId(parentId)
        .then((children) => {
          res.status(HttpStatus.OK).json({
            children,
          });
        })
        .catch((error) =>
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error }),
        );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  findChildrenById(@Param('id') id: string, @Res() res: Response) {
    try {
      this.childrenService
        .findChildrenById(id)
        .then((child) => {
          if (child != null) {
            res.status(HttpStatus.OK).json({
              child,
            });
          } else {
            throw new NotFoundException();
          }
        })
        .catch((error) =>
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error }),
        );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChildDto: UpdateChildDto) {
    return this.childrenService.update(+id, updateChildDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.childrenService.remove(+id);
  }
}
