import { Injectable } from '@angular/core';
import { Http, Response, Headers, ResponseOptions, ResponseContentType, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../environments/environment';

export const BASE_URL_IMPORT = environment.BASE_URL_IMPORT;
export const BASE_URL_INITIAL_BALANCE = environment.BASE_URL_INITIAL_BALANCE;
export const BASE_URL_REPORT = environment.BASE_URL_REPORT;
export const BASE_URL_CRUD = environment.BASE_URL_CRUD;
export const BASE_URL_BULK_UPLOAD = environment.BASE_URL_BULK_UPLOAD;
export const BASE_URL_ACCOUTING_ACCOUNT = environment.BASE_URL_ACCOUTING_ACCOUNT;
export const BASE_URL_SSO = environment.BASE_URL_SSO;
export const BASE_URL_COMMON_EXPENSES = environment.BASE_URL_COMMON_EXPENSES;
export const REALM = environment.REALM;

@Injectable()
export class AppService {
  headers = new Headers({ 'Content-Type': 'application/json' });
  endpoint: string = '/';

  constructor(public http: Http) {
  }

  get(url: string): Observable<Response> {
    return this.http.get(url);
  }

  remove(url: string): Observable<Response> {
    return this.http.delete(url, { headers: this.headers });
  }

  create(url: string, data: any): Observable<Response> {
    return this.http.post(url, (data instanceof Array || data instanceof Object) ? JSON.stringify(data) : data, { headers: this.headers });
  }

  update(url, data: any): Observable<Response> {
    return this.http.put(url, (data instanceof Array || data instanceof Object) ? JSON.stringify(data) : data, { headers: this.headers });
  }

  patch(url, data: any): Observable<Response> {
    return this.http.patch(url, (data instanceof Array || data instanceof Object) ? JSON.stringify(data) : data, { headers: this.headers });
  }

  generate(url: string, data: any): Observable<Response> {
    const options = new RequestOptions();
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    options.headers = headers;
    options.responseType = ResponseContentType.Blob;
    return this.http.post(url, data, options);
  }

  upload(url: string, formData: FormData): Observable<Response> {
    const headers = new Headers();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    return this.http.post(url, formData, headers);
  }

  handleError(error: any): Observable<Response> {
    console.log('An error occurred', error);
    return Observable.throw(error.message || error);
  }

  responseStatic(data: any): Observable<Response> {
    return Observable.of(new Response(new ResponseOptions({ body: data, status: 200, headers: new Headers, url: '/' })));
  }
}
