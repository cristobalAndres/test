import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class WalletService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getIncomeTypes(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/wallet/income-types`;
    return this.get(this.endpoint);
  }
  getPositiveBalance(propertyId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/properties/${propertyId}/wallet/positive-balance`;
    return this.get(this.endpoint);
  }
}

