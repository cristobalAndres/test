import * as moment from 'moment/moment'

export class ExpenseCreate {
  expense: ExpenseObjects[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class ExpenseObjects {
  code: number;
  date: string = moment(new Date().toISOString()).format('YYYY-MM-DD');
  expiration_date: string = moment(new Date().toISOString()).format('YYYY-MM-DD');
  amount: number;
  description: string;
  supplier_id: number;
  expense_type_id: number;
  community_id: number;
  expense_assignments: ExpenseAssign[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class ExpenseAssign {
  amount: number;
  account_id: number;
  account_primary_id: number;
  expense_fees: ExpenseFees[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class ExpenseFees {
  amount: number;
  description: string;
  number: number;
  period: number;
  expense_fee_sectors: ExpenseAssignSector[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class ExpenseAssignSector {
  sector_id: number;
  amount: number;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
