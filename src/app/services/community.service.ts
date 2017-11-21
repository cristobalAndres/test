import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';
import { COMMUNITY_FIXTURE } from '../fixtures/community.fixture';

@Injectable()
export class CommunityService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  all(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/administration/5/communities`;
    return this.get(this.endpoint);
  }

  getUnits(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/units/type`;
    return this.get(this.endpoint);
  }

  getUnitsByCommunity(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/units`;
    return this.get(this.endpoint);
  }

  createUnit(communityId: number, data: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/unit/create`;
    return this.create(this.endpoint, data);
  }
}

@Injectable()
export class MockCommunityService extends CommunityService {

  constructor(http: Http) {
    super(http);
  }

  all(): Observable<Response> {
    return this.responseStatic(COMMUNITY_FIXTURE);
  }

}

