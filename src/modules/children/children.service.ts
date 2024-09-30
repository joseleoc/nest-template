import { Injectable } from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Child } from './schemas/child.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectModel(Child.name) private readonly childModel: Model<Child>,
  ) {}

  create(createChildDto: CreateChildDto): Promise<Child> {
    return new Promise((resolve, reject) => {
      this.childModel
        .create(createChildDto)
        .then((res) => {
          const child = res.toObject();
          resolve(child);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  findAllByParentId(parentId: string): Promise<Child[]> {
    return new Promise((resolve, reject) => {
      this.childModel
        .find({ parentId })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => reject(error));
    });
  }

  findChildrenById(id: string): Promise<Child> {
    return new Promise((resolve, reject) => {
      this.childModel
        .findById(id)
        .then((res) => resolve(res))
        .catch((error) => reject(error));
    });
  }

  update(id: number, updateChildDto: UpdateChildDto) {
    return `This action updates a #${id} child`;
  }

  remove(id: number) {
    return `This action removes a #${id} child`;
  }
}
