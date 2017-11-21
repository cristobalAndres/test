import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD, BASE_URL_REPORT } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class PaymentService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  all(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/payments`;
    return this.get(this.endpoint);
  }

  advances(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/payments?type=positive_balance`;
    return this.get(this.endpoint);
  }

  pay(propertyId, data: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/properties/${propertyId}/payments`;
    return this.create(this.endpoint, data);
  }

  reversePay(communityId: number, payId): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/payment/reverse`;
    return this.create(this.endpoint, { payments: [payId] })
  }

  getNextFolio(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/payments/last-folio`;
    return this.get(this.endpoint);
  }

  lastPayment(propertyId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/properties/${propertyId}/payment/last-payment`;
    return this.get(this.endpoint);
  }

  downloadPDF(communityId: number, propertyId: number, paymentId: number): Observable<Response> {
    const data = {
      template: {
        shortid: 'HJhs5tloW',
      },
      data: {
        community_id: communityId,
        property_id: propertyId,
        payment_id: paymentId,
      }
    };
    this.endpoint = BASE_URL_REPORT;
    return this.generate(this.endpoint, data);
  }
}

@Injectable()
export class MockPaymentService extends PaymentService {

  constructor(http: Http) {
    super(http);
  }

  all(): Observable<Response> {
    return this.responseStatic([]);
  }

}

