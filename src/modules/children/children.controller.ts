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
  Logger,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ChildrenService } from './children.service';
import { UpdateChildDto, UpdateChildDtoSchema } from './dto/update-child.dto';
import { CreateChildDto, CreateChildDtoSchema } from './dto/create-child.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('Children')
@ApiBearerAuth()
@Controller('children')
export class ChildrenController {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(ChildrenController.name);

  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(private readonly childrenService: ChildrenService) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  @Post()
  @UsePipes(new ZodValidationPipe(CreateChildDtoSchema))
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
          this.logger.error(error);

          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      this.logger.error(error);

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
        .catch((error) => {
          this.logger.error(error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiResponse({ description: 'Retrieves a single child by a given id.' })
  findChildrenById(@Param('id') id: string, @Res() res: Response) {
    try {
      this.childrenService
        .findChildById(id)
        .then((child) => {
          if (child != null) {
            res.status(HttpStatus.OK).json({
              child,
            });
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

  @Patch('/update')
  @UsePipes(new ZodValidationPipe(UpdateChildDtoSchema))
  @ApiOperation({
    summary: 'Update a child',
    description:
      'Finds a child by id and updates the fields from the body. Returns the new instance of the child. The parentId is immutable. The child could be updated in the "deleted" field to false.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the child is updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Child not found',
  })
  update(@Body() updateChildDto: UpdateChildDto, @Res() res: Response) {
    try {
      this.childrenService
        .update(updateChildDto.childId, updateChildDto)
        .then((child) => {
          if (child != null) {
            res.status(HttpStatus.OK).json({ child });
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
        .catch((error) => {
          this.logger.error(error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
