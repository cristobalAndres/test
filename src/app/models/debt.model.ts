export class DebtType {
  id: number;
  name: string;
  slug: string;
}

export class Debt {
  id: number;
  description: string = '';
  bill_id: number;
  bill_type_id: number;
  debt_type: DebtType;
  amount: number;
  balance: number;
  deposit: number = 0;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
