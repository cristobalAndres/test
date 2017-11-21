export class Login {
  email: string = '';
  password: string = '';

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class ResetPassword extends Login {
  repeat_password?: string = '';

  constructor(values: Object = {}) {
    super(values);
    Object.assign(this, values);
  }
}
