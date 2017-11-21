export class Sector {
  id: number;
  name: string = '';
  active: boolean = true;
  slug: string = '';
  unit_sector?: {
    factor?: number;
  }

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
