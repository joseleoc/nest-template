import { Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import OpenAI from 'openai';

@Injectable()
export class StoriesService {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  async create(createStoryDto: CreateStoryDto) {
    return new Promise(async (resolve: (value: any) => void, reject) => {
      this.openai.chat.completions
        .create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            {
              role: 'user',
              content: 'Write a haiku about recursion in programming.',
            },
          ],
        })
        .then((completion) => {
          resolve(completion.choices[0].message);
        })
        .catch((error) => reject(error));
    });
  }

  findAll() {
    return `This action returns all stories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} story`;
  }

  update(id: number, updateStoryDto: UpdateStoryDto) {
    return `This action updates a #${id} story`;
  }

  remove(id: number) {
    return `This action removes a #${id} story`;
  }
}
