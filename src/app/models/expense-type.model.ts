export class ExpenseType {
  id?: number;
  name?: string = '';
  code?: string = '';

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
