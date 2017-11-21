import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_ACCOUTING_ACCOUNT } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class TransactionService extends AppService {

  constructor(http: Http) {
    super(http);
   }

  getAll(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${communityId}/transactions`;
    return this.get(this.endpoint);
  }
}
