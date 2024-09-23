import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: '1',
      userName: 'john',
      password: 'changeme',
    },
    {
      userId: '2',
      userName: 'maria',
      password: 'guess',
    },
  ];

  create(createUserDto: CreateUserDto) {
    console.log({ createUserDto });
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    return new Promise((resolve: (value: User) => void, reject) => {
      const user = this.users.find((user) => user.userName === id);

      if (user) resolve(user);
      else reject({ code: 404, message: 'User not found' });
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log({ updateUserDto });
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
