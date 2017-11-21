export class BillCategory {
  id?: number;
  name: string = '';
  active: boolean = true;
  community_id: number;
  bill_id?: number;
  slug?: string = '';

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
