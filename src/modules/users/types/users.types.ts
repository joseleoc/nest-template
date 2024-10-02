import { User, UserDocument } from '../schemas/user.schema';

export class PublicUser extends User {
  constructor(user: UserDocument) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, createdAt, ...data } = user.toObject();
    super(data);
    Object.assign(this, data);
  }
}
