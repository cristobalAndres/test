import { Property } from './property.model';

export class PaymentPositiveBalance {
  id: number;
  positive_balance_id: number;
  payment_id: number;
  add_balance: boolean;
}

export class PositiveBalances {
  id: number;
  amount: number;
  balance: number;
  payment_positive_balance: PaymentPositiveBalance;
}

export class PaymentsUsingPositiveBalance {
  id: number;
  folio: number;
}

export class Payment {
  id: number;
  amount: number;
  folio: number;
  property_id: number;
  property: Property;
  date: Date;
  created_at: string;
  updated_at: string;
  positive_balances: PositiveBalances[];
  payments_using_positive_balances: PaymentsUsingPositiveBalance [];
  is_reversed: boolean;
  is_mov_positive_balance: boolean;
  is_reconciled: boolean;
  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class PaymentView {
  id: number;
  amount: number;
  folio: number;
  property_id: number;
  date: Date;
  created_at: string;
  updated_at: string;
  positive_balances: PositiveBalances[];
  is_reversed: boolean;
  property_name: string;
  is_mov_positive_balance: boolean;
  is_reconciled: boolean;
  tooltip: string = '';
  payment: Payment;

  constructor(payment: Payment) {
    this.payment = payment;
    this.parse(this.payment);
  }

  parse(payment: Payment): void {
    if (payment) {
      this.id = payment.id;
      this.amount = payment.amount;
      this.folio = payment.folio;
      this.property_id = payment.property.id;
      this.property_name = payment.property.name;
      this.date = payment.date;
      this.created_at = payment.created_at;
      this.updated_at = payment.updated_at;
      this.positive_balances = payment.positive_balances;
      this.is_reversed = payment.is_reversed;
      this.is_mov_positive_balance = payment.is_mov_positive_balance;
      this.is_reconciled = payment.is_reconciled;
      this.tooltip = this.getToolTip();
    }
  }

  getToolTip(): string {
    let texto: string = '';
    let counter: number = 0;
    if ( this.payment.payments_using_positive_balances.length > 0 ) {
      this.payment.payments_using_positive_balances.forEach( (value) => {
        if (texto.length > 0) {
          texto += ',';
        }
        texto += `${value.folio}`;
        counter ++;
      });
    }
    return texto;
  };
}
