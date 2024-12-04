import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { SupportService } from './support.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  CreateSupportDto,
  CreateSupportDtoSchema,
} from './dto/create-support.dto';

@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSupportDtoSchema))
  submitSupport(@Body() body: CreateSupportDto, @Res() res) {
    this.supportService.submitSupport(body).then((data) => {
      res.status(200).json(data);
    });
  }
}
