import { Narrator, NarratorDocument } from '../narrators.schema';

export class PublicNarrator extends Narrator {
  id: string;
  constructor(narrator: NarratorDocument) {
    const data = narrator.toObject();
    super();
    delete data.voiceId;
    this.id = data._id.toString();
    Object.assign(this, data);
  }
}
