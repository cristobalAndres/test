import { Sector } from './sector.model';
import { BankAccount } from './bank-account.model';
import * as moment from 'moment/moment'

export class Fund {
  id: number;
  name: string = '';
  active: boolean;
  initial_amount: number = 0;
  initial_date: string = moment(new Date().toISOString()).format('YYYY-MM-DD');
  amount: number = 0;
  fund_income_type_id: number;
  bank_account_id: number;
  accounting_account_id: number;
  sectors: Sector[];
  bank_account: BankAccount;
  fund_income_type: any;
  balance?: any;
  total_balance?: number;
  state: any;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
