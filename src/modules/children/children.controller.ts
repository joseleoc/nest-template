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
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Children')
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @ApiResponse({
    description:
      'Creates a new child document. Links the child to the parentId and returns the new child instance',
  })
  create(@Body() createChildDto: CreateChildDto, @Res() res: Response) {
    try {
      this.childrenService
        .create(createChildDto)
        .then((child) => {
          if (child != null) {
            res.status(HttpStatus.CREATED).json({
              message: 'Child created successfully',
              child,
            });
          } else {
            throw new NotFoundException({
              message: 'parentId not found',
            });
          }
        })
        .catch((error) => {
          console.log({ error });
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/byParentId/:parentId')
  @ApiResponse({
    description: 'Gets all the children linked to a given parentId',
  })
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
  @ApiResponse({ description: 'Retrieves a single child by a given id.' })
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
  @ApiResponse({
    description:
      'Finds a child by id and updates the fields from the body. Returns the new instance of the child. The parentId is immutable. The child could be updated in the "deleted" field to false.',
  })
  update(
    @Param('id') id: string,
    @Body() updateChildDto: UpdateChildDto,
    @Res() res: Response,
  ) {
    try {
      this.childrenService
        .update(id, updateChildDto)
        .then((child) => {
          if (child != null) {
            res.status(HttpStatus.OK).json({ child });
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

  @Delete(':id')
  @ApiResponse({
    description:
      'Lazy delete a child. the document is not really deleted to prevent errors or to undo the action.',
  })
  remove(@Param('id') id: string, @Res() res: Response) {
    try {
      this.childrenService
        .remove(id)
        .then((deleted) => {
          if (deleted != null) {
            res.status(HttpStatus.OK).json(deleted);
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
}
