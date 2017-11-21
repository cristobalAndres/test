import { User } from './user.model';
import { Unit } from './unit.model';
import { Factor } from './factor.model';

export class Property {
  id: number;
  name: string = '';
  code?: string = '';
  slug: string = '';
  users?: User[] = [];
  units?: Unit[] = [];
  factors?: Factor[] = [];
  state?: Boolean;
  amount?: number;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class PropertyView {
  id: number;
  name: string = '';
  code?: string = '';
  slug: string = '';
  user?: string = '';
  units?: string[] = [];
  units_str?: string = '';
  factors?: Factor[] = [];
  factors_str?: string = '';
  property: Property = null;

  private static toArrayOfName(object: any[]): string[] {
    let array = [];
    array = object.map(item => {
      return item.name;
    });
    return array;
  }

  private static arrayToStr(array: string[]): string {
    let str = '';
    if (array) {
      str = array.join(' ');
    }
    return str;
  }


  constructor(property: Property) {
    this.property = property;
    this.parse(this.property);
  }

  parse(property: Property): void {
    if (property) {
      this.id = property.id ? property.id : null;
      this.name = property.name ? property.name : '';
      this.code = property.code ? property.code : '';
      this.slug = property.slug ? property.slug : '';
      this.user = property.users.length > 0 ? property.users[0].auth_user.name + ' '
        + property.users[0].auth_user.lastname : '';
      this.units = property.units.length > 0 ? PropertyView.toArrayOfName(property.units) : [];
      this.units_str = this.units.length > 0 ? PropertyView.arrayToStr(this.units) : '';
      this.factors = property.factors.length > 0 ? property.factors : [];
      this.factors_str = this.factors.length > 0 ? PropertyView.arrayToStr(PropertyView.toArrayOfName(this.factors)) : '';
    }
  }
}
