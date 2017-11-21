import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_BULK_UPLOAD, BASE_URL_CRUD, BASE_URL_INITIAL_BALANCE, BASE_URL_REPORT } from '../app.service';
import { Observable } from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class FundService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getBankAccount(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/banks/accounts`;
    return this.get(this.endpoint);
  }

  getIncomeTypeFund(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/funds/income-types`;
    return this.get(this.endpoint);
  }

  getSector(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/sectors`;
    return this.get(this.endpoint);
  }

  createFund(formData: FormData, communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/funds`;
    return this.create(this.endpoint, formData);
  }

  updateFund(formData: FormData, communityId: number, fundId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/fund/${fundId}`;
    return this.update(this.endpoint, formData);
  }

  deleteFund(communityId: number, fundId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/fund/${fundId}`;
    return this.remove(this.endpoint);
  }

  getFunds(communityId: number, balance: boolean = false): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/funds?balance=${balance}`;
    return this.get(this.endpoint);
  }

  getFundById(communityId: number, fundId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/fund/${fundId}`;
    return this.get(this.endpoint);
  }

  updateActive(communityId: number, fundId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/funds/change-active`;
    return this.update(this.endpoint, { funds: [fundId] });
  }

}
