import * as moment from 'moment';
import { PaymentItem } from './payment-item.model';
import { Debt } from './debt.model';
import { BankAccount } from './bank-account.model';

export class PaymentData {
  id: number;
  date: string = moment(new Date().toISOString()).format('YYYY-MM-DD hh:mm');
  folio: number;
  comments: string;
  haveUniquePayment: boolean = false;
  debits: Debt[] = [];
  credits: PaymentItem[] = [];
  bank_account_id: number;
  bank_account: BankAccount = new BankAccount();

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
