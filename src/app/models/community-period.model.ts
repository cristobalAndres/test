import { Community } from './community.model';
import { StatusPeriod } from './status-period.model';

export class CommunityPeriod {
  id: number;
  status_period_id: number;
  status_period: StatusPeriod;
  community_id: number;
  community: Community;
  amount: number;
  period: string = '';
  created_at: string = '';
  updated_at: string = '';
  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
