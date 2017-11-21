import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';
import { COMMUNITY_FIXTURE } from '../fixtures/community.fixture';

@Injectable()
export class BankService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  all(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/banks`;
    return this.get(this.endpoint);
  }

}
