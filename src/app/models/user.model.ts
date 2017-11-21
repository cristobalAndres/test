export class User {
  id: number;
  uid: number;
  auth_user?: {
    lastname?: string,
    motherlastname?: string,
    name?: string,
  }

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
