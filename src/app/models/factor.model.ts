export class Factor {
  slug: string = '';
  name: string = '';
  factor: number = 0;
  recalculated?: number = 0;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
