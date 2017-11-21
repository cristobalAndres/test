export class ExpenseAccountingModel {
  id: number;
  name: string = '';
  alias: string = '';
  code: number;
  parent_id: number;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
