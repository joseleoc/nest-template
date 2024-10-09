import { Injectable } from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Child } from './schemas/child.schema';
import { Model } from 'mongoose';
import { PublicChild } from './types/children.types';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectModel(Child.name) private readonly childModel: Model<Child>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  create(createChildDto: CreateChildDto): Promise<Child | null> {
    return new Promise((resolve, reject) => {
      this.userModel
        .findById(createChildDto.parentId)
        .then((parent) => {
          if (parent != null && parent.deleted === false) {
            this.childModel
              .create(createChildDto)
              .then((res) => {
                const child = res.toObject();
                resolve(child);
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            resolve(null);
          }
        })
        .catch((error) => reject(error));
    });
  }

  findAllByParentId(parentId: string): Promise<Child[]> {
    return new Promise((resolve, reject) => {
      this.childModel
        .find({ parentId, deleted: false })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => reject(error));
    });
  }

  findChildById(id: string): Promise<PublicChild | null> {
    return new Promise((resolve, reject) => {
      this.childModel
        .findById(id)
        .then((res) => {
          if (res != null && res.deleted === false)
            resolve(new PublicChild(res));
          else resolve(null);
        })
        .catch((error) => reject(error));
    });
  }

  update(id: string, updateChildDto: UpdateChildDto): Promise<Child | null> {
    return new Promise((resolve, reject) => {
      this.childModel
        .findByIdAndUpdate(id, updateChildDto, { new: true })
        .then((res) => {
          if (res != null) {
            const updatedChild = new PublicChild(res);
            resolve(updatedChild);
          } else resolve(null);
        })
        .catch((error) => reject(error));
    });
  }

  remove(id: string): Promise<{ id: string; deleted: boolean }> {
    return new Promise((resolve, reject) => {
      this.childModel
        .findByIdAndUpdate(id, { deleted: true })
        .then((res) => {
          if (res != null) {
            resolve({ id, deleted: true });
          } else {
            resolve(null);
          }
        })
        .catch((error) => reject(error));
    });
  }
}
