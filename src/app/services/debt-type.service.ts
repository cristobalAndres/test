import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class DebtTypeService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getDebtsTypes(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/interest-fines/debt-type`;
    return this.get(this.endpoint);
  }
}
