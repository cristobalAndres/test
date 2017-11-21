import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class SuppliersService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getAll(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/suppliers`;
    return this.get(this.endpoint);
  }
}

