import { Child, ChildDocument } from '../schemas/child.schema';

export class PublicChild extends Child {
  _id: string;
  constructor(child: ChildDocument) {
    const data = child.toObject();
    super(data);
    Object.assign(this, data);
  }
}
