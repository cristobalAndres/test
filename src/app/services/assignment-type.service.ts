import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class AssignmentsTypeService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getAssignmentsTypes(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/expense/assignment-type`;
    return this.get(this.endpoint);
  }

  getAssignmentType(type: string): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/expense/assignment-type?type=${type}`;
    return this.get(this.endpoint);
  }
}

