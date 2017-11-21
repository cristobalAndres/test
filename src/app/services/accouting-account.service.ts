import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_ACCOUTING_ACCOUNT } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class AccoutingAccountService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getAll(community: number): Observable<Response> {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${community}/accounts/common-expenses`;
    return this.get(this.endpoint);
  }

  getAllWithSctors(community: number) {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${community}/accounts/common-expenses?include=accountSector`;
    return this.get(this.endpoint);
  }

  getAccountsCustomerServices(community: number) {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${community}/account/consumer/services`;
    return this.get(this.endpoint);
  }

  getAccountAssignment(assignmentId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/accounts/expense-assignments/${assignmentId}`;
    return this.get(this.endpoint);
  }

  updateAccountAlias(communityId: number, accountId: number, alias: any) {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${communityId}/account/${accountId}/alias`;
    return this.patch(this.endpoint, alias);
  }

  createAccountChildren(communityId: number, parentAccountId: number, data: any) {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${communityId}/account/${parentAccountId}/create-child`;
    return this.create(this.endpoint, data);
  }

  setAccountOnSector(communityId: number, accountId: number, sectorId: number, data) {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${communityId}/account/${accountId}/sector/${sectorId}`;
    return this.create(this.endpoint, data);
  }

  setAccontsSectorsBulk(communityId: number, sectorId: number, data) {
    this.endpoint = `${BASE_URL_ACCOUTING_ACCOUNT}/communities/${communityId}/accounts/sector/${sectorId}`;
    return this.create(this.endpoint, data);
  }
}

