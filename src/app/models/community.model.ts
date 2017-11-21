export class Community {
  id: number;
  name: string = '';
  identification_number: string = '';
  code?: string = '';
  active: string = '';
  administracion_id?: number;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
