export class DebtTypeModel {
  id: number;
  name: string = '';
  slug: string = '';
  state: boolean = true;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
