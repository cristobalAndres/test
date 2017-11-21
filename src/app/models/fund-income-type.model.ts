export class FundIncomeType {
  id: number;
  name: string = '';
  created_at: string = '';
  updated_at: string = '';
  deleted_at: string = '';
  active: string = '';
  slug: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

