import { Sector } from './sector.model';

export class Unit {
  id: number;
  name: string;
  mt2: number;
  floor: string;
  slug: string;
  sectors?: Sector[];
  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
