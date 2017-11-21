export class WalletIncomeType {
  id: number = 0;
  name: string = 'none';
  slug: string = 'none';
  active: boolean = true;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
