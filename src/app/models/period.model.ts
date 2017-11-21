export class Period {
  id: number;
  period: number = null;
  glosa: string = '';
  active: Boolean = true;
  name: string;
  number: number;
  periodGroup: number;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
