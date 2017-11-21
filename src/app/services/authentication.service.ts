import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { AppService, BASE_URL_SSO, REALM } from '../app.service';


@Injectable()
export class AuthenticationService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  login(username: string, password: string): Observable<Response> {
    this.endpoint = `${BASE_URL_SSO}/login`;
    return this.create(this.endpoint, { username: username, password: password, realm: REALM });
  }

  check(token: string): Observable<Response> {
    this.endpoint = `${BASE_URL_SSO}/check?access_token=${token}`;
    return this.get(this.endpoint);
  }

  reset(username: string): Observable<Response> {
    this.endpoint = `${BASE_URL_SSO}/reset`;
    return this.create(this.endpoint, { username: username, realm: REALM });
  }

  restore(username: string, password: string, token: string): Observable<Response> {
    this.endpoint = `${BASE_URL_SSO}/reset/${token}`;
    return this.create(this.endpoint, { username: username, password: password, realm: REALM });
  }

  logout(token: string): Observable<Response> {
    // remove user from local storage to log user out
    this.endpoint = `${BASE_URL_SSO}/logout?access_token=${token}`;
    return this.get(this.endpoint);
  }
}
