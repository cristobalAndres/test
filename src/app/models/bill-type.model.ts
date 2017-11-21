export class BillType {
  id: number;
  name: string = '';
  description: string = '';
  created_at: Date;
  updated_at: Date;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
