import { isNumber } from 'lodash';
import { Plan, PlanDocument } from './schemas/plan.schema';

export class PublicPlan extends Plan {
  id: string;
  constructor(plan: PlanDocument) {
    const data = plan.toObject();
    super();
    this.id = data._id.toString();
    delete (data as any)._id;
    Object.assign(this, data);
    console.log(this.creditsLimit);
    if (isNumber(this.creditsLimit) && !isFinite(this.creditsLimit)) {
      this.creditsLimit = 'Infinity';
    }
  }
}
