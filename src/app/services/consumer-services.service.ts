import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';
import { BILL_FIXTURE } from '../fixtures/bill.fixture';

@Injectable()
export class ConsumerServicesService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getAll(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/consumer-services-dist-field`;
    return this.get(this.endpoint);
  }

  verifyTypla(communityId: number, sectorId: number, suplierId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/sector/${sectorId}/suplier/${suplierId}`;
    return this.get(this.endpoint);
  }

  postDistributions(data: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/consumer-services/distribution`;
    return this.create(this.endpoint, data);
  }

  getConsumerServices(sectorId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/sector/${sectorId}/consumer-services`;
    return this.get(this.endpoint);
  }

  getFields(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/consumer-services/fields`;
    return this.get(this.endpoint);
  }

  createService(communityId: number, data: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/consumer-services`;
    return this.create(this.endpoint, data);
  }

  getDistribution(sectorId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/sector/${sectorId}/consumer-services`;
    return this.get(this.endpoint);
  }

  expensesDistribution(community: number, supplierId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/deferred-expenses?supplier= ${supplierId}`;
    return this.get(this.endpoint);
  }

  distributionsSector(community: number, sectorId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/sectors/${sectorId}/consumer-services/distribution`;
    return this.get(this.endpoint);
  }

  postAssignDistribution(communityId, data: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/consumer-services/expense-assign`;
    return this.create(this.endpoint, data);
  }

  getConsumerServicesReading(communityId: number, consumerServiceId: number, period, sector: number) {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/consumer-service/${consumerServiceId}/period/${period}/sector/${sector}/readings`;
    return this.get(this.endpoint);
  }

  sendReading(communityId: number, consumerServiceId: number, period: number, data: any) {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/consumer-service/${consumerServiceId}/period/${period}/readings`;
    return this.create(this.endpoint, data);
  }

  removeReading(communityId: number, consumerServiceId: number, period: number) {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/consumer-service/${consumerServiceId}/period/${period}/readings`;
    return this.remove(this.endpoint);
  }

  getPeriodLocked(communityId: number) {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/periods?status=CLOSED,RELEASED`;
    return this.get(this.endpoint);
  }

  getExpendAssignServiceManual(communityId: number, sector: number, consumerService: number, period: number) {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/sectors/${sector}/consumer-services/${consumerService}/expense-assign-service?period=${period}`;
    return this.get(this.endpoint);
  }

}


