export class StatusPeriod {
  id: number;
  name: string = '';
  slug: string = '';

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
