import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  Logger,
  NotFoundException,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { StoriesService } from './stories.service';
import { CreateStoryDto, CreateStoryDtoSchema } from './dto/create-story.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  StoryCounterDto,
  StoryCounterDtoSchema,
} from './dto/story-counter.dto';
import {
  GetAllStoriesDto,
  GetAllStoriesDtoSchema,
} from './dto/get-all-stories.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  GetReportsDto,
  GetReportsDtoSchema,
  ReportStoryDto,
  ReportStoryDtoSchema,
} from './dto/report-story.dto';

@ApiTags('Stories')
@ApiBearerAuth()
@Controller('stories')
export class StoriesController {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(StoriesController.name);

  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(private readonly storiesService: StoriesService) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  @Post()
  @UsePipes(new ZodValidationPipe(CreateStoryDtoSchema))
  @ApiOperation({
    summary: 'Create a story',
    description:
      'Creates a story with IA, saves to the db and returns the story with the audios urls.',
  })
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
        this.logger.error(error);
        if (error?.code != null) {
          res.status(error.code).json(error);
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        }
      });
  }

  @Post('getAllStories')
  @UsePipes(new ZodValidationPipe(GetAllStoriesDtoSchema))
  @ApiOperation({
    summary: 'Get all stories',
    description: `Returns an array of paginated stories. 
    The default pagination is page 0 and limit 10. 
    If the page or limit is set to 0 or less than 0, it will be set to 10. 
    If the limit is set to greater than 50, it will be set to 50.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the stories are found, an array of stories',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  getAllStories(@Body() body: GetAllStoriesDto, @Res() res: Response) {
    this.storiesService
      .getAllStories(body)
      .then((stories) => {
        res.status(HttpStatus.OK).json(stories);
      })
      .catch((error) => {
        this.logger.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }

  @Get('userStories/:id')
  @ApiOperation({
    summary: 'Finds all stories created by a user',
    description: 'Returns an array of stories',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the user has stories, an array of stories',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  findUserStories(@Param('id') id: string, @Res() res: Response) {
    try {
      this.storiesService
        .findUserStories(id)
        .then((stories) => {
          res.status(HttpStatus.OK).json(stories);
        })
        .catch((error) => {
          this.logger.error(error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      this.logger.error(error);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
    }
  }

  @Post('/toggleLike')
  @UsePipes(new ZodValidationPipe(StoryCounterDtoSchema))
  @ApiOperation({
    summary: 'Toggles the like of a story',
    description:
      'If the user has already liked the story, it will remove the like. Otherwise, it will add a like. And returns the likesCount of the story.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Toggles the like of a story',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            likesCount: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Story not found',
  })
  toggleLike(@Body() body: StoryCounterDto, @Res() res: Response) {
    try {
      this.storiesService
        .toggleLike(body)
        .then((story) => {
          if (story != null) {
            res.status(HttpStatus.OK).json({ likesCount: story.likesCount });
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
    }
  }

  @Post('/countView')
  @UsePipes(new ZodValidationPipe(StoryCounterDtoSchema))
  @ApiOperation({
    summary: 'Counts the view of a story',
    description:
      'Always increments the viewsCount by 1 every time it is called.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Counts the view of a story.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            viewsCount: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Story not found',
  })
  countView(@Body() body: StoryCounterDto, @Res() res: Response) {
    try {
      this.storiesService
        .countView(body)
        .then((story) => {
          if (story != null) {
            res.status(HttpStatus.OK).json({ viewsCount: story.viewsCount });
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
    }
  }

  @Post('/countShare')
  @UsePipes(new ZodValidationPipe(StoryCounterDtoSchema))
  @ApiOperation({
    summary: 'Counts the share of a story',
    description:
      'Always increments the sharesCount by 1 every time it is called.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Counts the share of a story.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            sharesCount: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Story not found',
  })
  countShare(@Body() body: StoryCounterDto, @Res() res: Response) {
    try {
      this.storiesService
        .countShare(body)
        .then((story) => {
          if (story != null) {
            res.status(HttpStatus.OK).json({ sharesCount: story.sharesCount });
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
    }
  }

  @Post('/report')
  @UsePipes(new ZodValidationPipe(ReportStoryDtoSchema))
  @ApiOperation({
    summary: 'Report a story',
    description:
      'Reports a story to the moderators. The reason is limited to 265 characters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the story is reported successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Story not found',
  })
  report(@Body() body: ReportStoryDto, @Res() res: Response) {
    this.storiesService
      .report(body)
      .then((report) => {
        if (report?.reportId == null) {
          throw new NotFoundException();
        }
        res.status(HttpStatus.OK).json({
          message: 'Story reported successfully',
          reportId: report.reportId,
        });
      })
      .catch((error) => {
        this.logger.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }

  @Post('/getReports')
  @UsePipes(new ZodValidationPipe(GetReportsDtoSchema))
  @ApiOperation({
    summary: 'Get reports',
    description: `Returns an array of reports. 
    The default pagination is page 0 and limit 10. 
    If the page or limit is set to 0 or less than 0, it will be set to 10. 
    If the limit is set to greater than 50, it will be set to 50.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'When the reports are found, an array of reports',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, could be caused by a database error.',
  })
  getReports(@Body() body: GetReportsDto, @Res() res: Response) {
    this.storiesService
      .getReports(body)
      .then((reports) => {
        res.status(HttpStatus.OK).json(reports);
      })
      .catch((error) => {
        this.logger.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }
}
