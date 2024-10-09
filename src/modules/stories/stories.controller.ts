import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Stories')
@ApiBearerAuth()
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'When the story is created successfully',
  })
  @ApiResponse({
    status: HttpStatus.PAYMENT_REQUIRED,
    description: 'Payment required when the user does not have enough credits',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'When the user does not exist, is deleted or is not found',
  })
  create(@Body() createStoryDto: CreateStoryDto, @Res() res: Response) {
    this.storiesService
      .create(createStoryDto)
      .then((story) => {
        res.status(HttpStatus.CREATED).json(story);
      })
      .catch((error) => {
        if (error?.code != null) {
          res.status(error.code).json(error);
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        }
      });
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the user has stories',
  })
  @Get('userStories/:id')
  findUserStories(@Param('id') id: string, @Res() res: Response) {
    try {
      this.storiesService
        .findUserStories(id)
        .then((stories) => {
          res.status(HttpStatus.OK).json(stories);
        })
        .catch((error) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
    }
  }

  // @Get()
  // findAll() {
  //   return this.storiesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.storiesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStoryDto: UpdateStoryDto) {
  //   return this.storiesService.update(+id, updateStoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.storiesService.remove(+id);
  // }
}
