/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateNarratorDto } from './dto/create-narrator.dto';
import { UpdateNarratorDto } from './dto/update-narrator.dto';

@Injectable()
export class NarratorsService {
  create(createNarratorDto: CreateNarratorDto) {
    return 'This action adds a new narrator';
  }

  findAll() {
    return `This action returns all narrators`;
  }

  findOne(id: number) {
    return `This action returns a #${id} narrator`;
  }

  update(id: number, updateNarratorDto: UpdateNarratorDto) {
    return `This action updates a #${id} narrator`;
  }

  remove(id: number) {
    return `This action removes a #${id} narrator`;
  }
}
