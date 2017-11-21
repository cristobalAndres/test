import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class BankAccountService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  all(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/banks/accounts`;
    return this.get(this.endpoint);
  }

  getBankList(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/banks`;
    return this.get(this.endpoint);
  }

  getBankAccountTypes(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/banks/account/type`;
    return this.get(this.endpoint);
  }

  getBankAccountById(bankAccountId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/bank/account/${bankAccountId}`;
    return this.get(this.endpoint);
  }

  createBanksAccount(communityId: number, data: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/banks/account`;
    return this.create(this.endpoint, data);
  }

  updateBankAccount(communityId: number, id: number, data: any) {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/banks/account/${id}`;
    return this.update(this.endpoint, data);
  }

  deleteBankAccount(communityId: number, bankAccountId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/banks/account/${bankAccountId}`;
    return this.remove(this.endpoint);
  }

  changeDefaultBankAccount(communityId: number, bankAccountId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/banks/account/${bankAccountId}/change-default`;
    return this.get(this.endpoint);
  }
}
