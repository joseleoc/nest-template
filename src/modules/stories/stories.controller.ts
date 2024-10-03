import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  create(@Body() createStoryDto: CreateStoryDto, @Res() res: Response) {
    console.log({ createStoryDto });
    this.storiesService
      .create(createStoryDto)
      .then((story) => {
        res.status(HttpStatus.CREATED).json(story);
      })
      .catch((error) => {
        console.log(error);
        if (error?.code != null) {
          res.status(error.code).json(error);
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        }
      });
  }

  @Get()
  findAll() {
    return this.storiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoryDto: UpdateStoryDto) {
    return this.storiesService.update(+id, updateStoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storiesService.remove(+id);
  }
}
