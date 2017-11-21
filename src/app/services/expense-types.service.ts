import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ExpensesTypesService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getAll(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/expenses/types`;
    return this.get(this.endpoint);
  }
}

