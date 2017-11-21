import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';
import { BILL_FIXTURE } from '../fixtures/bill.fixture';

@Injectable()
export class BillService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  all(propertyId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/properties/${propertyId}/bills/released?include=billType`;
    return this.get(this.endpoint);
  }

  allAdvance(propertyId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/properties/${propertyId}/bills/released?include=billType&advance=true`;
    return this.get(this.endpoint);
  }

  getDebt(billId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/bills/${billId}/debts/payable?include=fund,debtType`;
    return this.get(this.endpoint);
  }

  getBillingNotes(communityId: number, options: any): Observable<Response> {
    let query = '';
    Object.keys(options).forEach(key => {
      query = query === '' ? `?${key}=${options[key]}` : `${query}&${key}=${options[key]}`;
    });
    console.log(options, Object.keys(options));
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/bills/search${query}`;
    return this.get(this.endpoint);
  }

  postCreditNotes(communityId: number, form: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/credit-note`;
    return this.create(this.endpoint, form);
  }
}

@Injectable()
export class MockBillService extends BillService {

  constructor(http: Http) {
    super(http);
  }

  all(): Observable<Response> {
    return this.responseStatic(BILL_FIXTURE);
  }
}

