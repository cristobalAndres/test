import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_BULK_UPLOAD, BASE_URL_CRUD, BASE_URL_INITIAL_BALANCE, BASE_URL_REPORT, BASE_URL_ACCOUTING_ACCOUNT } from '../app.service';
import { Observable } from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class FinancialStateService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getFinancialState(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${communityId}/accounts/financial/report`;
    return this.get(this.endpoint);
  }

}
