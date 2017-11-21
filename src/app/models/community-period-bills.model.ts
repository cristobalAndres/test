import { Bill } from './bill.model';
import { CommunityPeriod } from './community-period.model';

export class CommunityPeriodBills {
  id: number;
  community_period_id: number;
  community_period: CommunityPeriod;
  bill_id: number;
  bill: Bill;
  created_at: string = '';
  updated_at: string = '';

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
