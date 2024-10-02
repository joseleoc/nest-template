import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NarratorsService } from './narrators.service';
import { CreateNarratorDto } from './dto/create-narrator.dto';
import { UpdateNarratorDto } from './dto/update-narrator.dto';

@Controller('narrators')
export class NarratorsController {
  constructor(private readonly narratorsService: NarratorsService) {}

  @Post()
  create(@Body() createNarratorDto: CreateNarratorDto) {
    return this.narratorsService.create(createNarratorDto);
  }

  @Get()
  findAll() {
    return this.narratorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.narratorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNarratorDto: UpdateNarratorDto) {
    return this.narratorsService.update(+id, updateNarratorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.narratorsService.remove(+id);
  }
}
