import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class SettingsService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getSettings(community: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/settings`;
    return this.get(this.endpoint);
  }
}

