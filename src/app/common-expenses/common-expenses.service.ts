import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_BULK_UPLOAD, BASE_URL_CRUD, BASE_URL_INITIAL_BALANCE, BASE_URL_REPORT, BASE_URL_ACCOUTING_ACCOUNT, BASE_URL_COMMON_EXPENSES } from '../app.service';
import { Observable } from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class CommonExpensesService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getExpenseAssign(communityId: number, period: string): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/common-expenses/communities/${communityId}/period/${period}`;
    return this.get(this.endpoint);
  }

  getAccountAssign(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${communityId}/expense-assignments/accounts`;
    return this.get(this.endpoint);
  }

  getValidationsCloseCommonExpense(communityId: number, period: string): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/common-expenses/${communityId}/period/${period}/validate`;
    return this.get(this.endpoint);
  }

  closePeriod(data, communityId, period) {
    this.endpoint = `${BASE_URL_COMMON_EXPENSES}/generation/${communityId}/period/${period}`;
    return this.create(this.endpoint, data);
  }
}
