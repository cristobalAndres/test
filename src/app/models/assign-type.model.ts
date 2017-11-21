export class AssignType {
  id: number;
  name: string = '';
  slug: string = '';
  state: Boolean = true;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
