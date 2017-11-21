import { BillType } from './bill-type.model';
import { CommunityPeriodBills } from './community-period-bills.model';
import { CommunityPeriod } from './community-period.model';

export class Bill {
  id: number;
  code: string = '';
  property_id: number;
  bill_type_id: number;
  category_id: number;
  date: Date;
  closed_at: Date;
  released_at: Date;
  expired_at: Date;
  bill_type?: BillType;
  community_periods: CommunityPeriod[];
  community_period_bills: CommunityPeriodBills;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
