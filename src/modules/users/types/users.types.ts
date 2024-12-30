import { User, UserDocument } from '../schemas/user.schema';

export class PublicUser extends User {
  id: string;
  constructor(user: UserDocument) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, ...data } = user.toObject();
    super(data);
    Object.assign(this, data);
    this.id = data._id.toString();
    delete (data as any)._id;
  }
}

export type ChangePasswordParams = {
  oldPassword: string;
  newPassword: string;
  userEmail: string;
};

export type CheckUserCreditsResponse = {
  user: PublicUser | null;
  canCreateStory: boolean;
  canAddAudio: boolean;
  canAddImage: boolean;
  canAddText: boolean;
};
