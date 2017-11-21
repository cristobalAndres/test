import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../../app.service';
import { Observable } from 'rxjs/Rx';

// Models
import { InterestFine } from '../../models/interest-fine.model';

@Injectable()
export class InterestFineService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getMetadataInterestForDebt(keys: string[]): Observable<Response> {
    let query = `${BASE_URL_CRUD}/interest-fine/fields`;
    if (keys) {
      keys.forEach((key, _index) => {
        if (_index > 0) {
          query = query + `&key=${key}`;
        } else {
          query = query + `?key=${key}`;
        }
      })
    }
    this.endpoint = query;
    return this.get(this.endpoint);
  }

  getInterestFine(communityId: number, type: Boolean): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/interest-fines?active=${type}`;
    return this.get(this.endpoint);
  }

  postInterestForDebt(communityId: number, interestForDebt: InterestFine): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/interest-fine/create`;
    return this.create(this.endpoint, interestForDebt);
  }

}
