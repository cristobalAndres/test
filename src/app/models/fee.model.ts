import { Sector } from './sector.model';

export class Fee {
  id?: number;
  amount?: number;
  description?: string;
  number?: number;
  period?: number;
  expense_assignment_id?: number;
  active?: string = '';
  expense_fee_sectors?: Sector[];
  periodState?: Boolean;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
