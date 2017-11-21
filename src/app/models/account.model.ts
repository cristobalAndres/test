export class Account {
  id: number;
  name: string = '';
  created_at: string = '';
  updated_at: string = '';
  deleted_at: string = '';
  parent_id: number;
  alias: string;
  code: number;
  community_id: number;
  children: Account[];
  active: Boolean = true;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
