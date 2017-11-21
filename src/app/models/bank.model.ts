export class Bank {
    id: number;
    name: string = '';
    created_at: string = '';
    updated_at: string = '';
    deleted_at: string = '';
    active: string = '';

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
