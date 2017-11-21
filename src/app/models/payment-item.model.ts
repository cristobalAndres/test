import { WalletIncomeType } from './wallet-income-type.model';
import { Bank } from './bank.model';
import { BankAccount } from './bank-account.model';

export class PaymentItem {
  id: any;
  wallet_income_type_id: number = 0;
  wallet_income_type?: WalletIncomeType;
  payment_income_origin_id: number = 0;
  payment_income_origin?: Bank;
  payment_bank_account_destiny_id: number = 0;
  payment_bank_account_destiny?: BankAccount;
  payment_amount: number = 0;
  payment_document_date: string = '';
  payment_document_number: string;

  constructor(values: Object = {}) {
    this.id = new Date().getTime();
    Object.assign(this, values);
  }
}
