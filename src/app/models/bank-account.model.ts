import { Bank } from './bank.model';
import { Community } from './community.model';

export class BankAccount {
  id: number;
  code: string;
  bank_id: number;
  bank: Bank = new Bank();
  bank_account_type_id: number;
  bank_account_type: BankAccountType = new BankAccountType();
  initial_amount: number;
  initial_Date: string;
  community_id: number;
  community: Community = new Community();
  executive_name: string;
  executive_email: string;
  executive_phone: string;
  active: boolean;
  created_at: string = '';
  updated_at: string = '';
  initial_date: string = '';
  is_default: Boolean;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class BankAccountType {
  id: number;
  name: string = '';
  active: string = '';
  created_at: string = '';
  updated_at: string = '';

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
