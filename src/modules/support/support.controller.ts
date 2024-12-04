import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { SupportService } from './support.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  CreateSupportDto,
  CreateSupportDtoSchema,
} from './dto/create-support.dto';
import { SkipAuth } from '@/decorators/index';

@ApiTags('Support')
@SkipAuth()
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSupportDtoSchema))
  @ApiResponse({
    status: 201,
    description: 'When the support is submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'When the request is not valid. For if the request body is not valid. The error should contain a message and a code that represents where is the error.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, could be caused by a database error.',
  })
  submitSupport(@Body() body: CreateSupportDto, @Res() res) {
    this.supportService
      .submitSupport(body)
      .then((data) => {
        res.status(201).json(data);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }
}
