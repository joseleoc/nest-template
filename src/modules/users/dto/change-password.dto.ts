import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class ChangePasswordDto extends PickType(CreateUserDto, [
  'password',
  'email',
]) {
  newPassword: string;
}
