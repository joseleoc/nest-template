import { Narrator, NarratorDocument } from '../schemas/narrators.schema';

export class PublicNarrator extends Narrator {
  id: string;
  constructor(narrator: NarratorDocument) {
    const data = narrator.toObject();
    super();
    this.id = data._id.toString();
    Object.assign(this, data);
  }
}
