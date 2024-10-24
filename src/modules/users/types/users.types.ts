import { User, UserDocument } from '../schemas/user.schema';

export class PublicUser extends User {
  id: string;
  constructor(user: UserDocument) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, createdAt, _id, ...data } = user.toObject();
    super(data);
    Object.assign(this, data);
    this.id = _id.toString();
  }
}

export type ChangePasswordParams = {
  oldPassword: string;
  newPassword: string;
  userEmail: string;
};
