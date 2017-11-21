import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class PropertyService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  all(communityId: number, advance?: Boolean): Observable<Response> {
    if (advance) {
      this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/properties?advance=${advance}`;
    } else {
      this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/properties`;
    }
    return this.get(this.endpoint);
  }

  deleteById(communityId: number, propertyId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/properties/${propertyId}`;
    return this.remove(this.endpoint);
  }

  findById(communityId: number, propertyId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/properties/${propertyId}`;
    return this.get(this.endpoint);
  }
  assignUnitToProperty(communityId: number, data: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/units/admin-assign`;
    return this.create(this.endpoint, data);
  }
}
