import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_COMMON_EXPENSES, BASE_URL_REPORT } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ReportService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  generalCollectionReport(communityId: number, period: any): Observable<Response> {
    this.endpoint = `${BASE_URL_COMMON_EXPENSES}/common-expense/${communityId}/period/${period}`;
    return this.get(this.endpoint);
  }

  generalCollection(communityId: number, period: any): Observable<Response> {
    this.endpoint = `${BASE_URL_COMMON_EXPENSES}/general/${communityId}/period/${period}`;
    return this.get(this.endpoint);
  }

  generalCollectionReportGeneration(communityId: number, period: any, date: any): Observable<Response> {
    this.endpoint = `${BASE_URL_COMMON_EXPENSES}/community/${communityId}/period/${period}/date/${date}/collection-report`;
    return this.get(this.endpoint);
  }

  generateCollectionReportXLSX(communityId: number, json: any): Observable<Response> {
    const properties = json.report;
    const sectors = json.sectors;
    const consumerServices = json.consumerServices;
    const funds = json.funds;
    const surcharges = json.surchargesCategorie;
    const totals = json.totals;

    const data = {
      template: {
        shortid: 'ByJnxzqJz'
      },
      data: {
        community_id: communityId,
        datos: properties,
        sectors: sectors,
        consumerServices: consumerServices,
        funds: funds,
        surcharges: surcharges,
        totals: totals
      }
    };
    this.endpoint = BASE_URL_REPORT;
    return this.generate(this.endpoint, data);
  }
}
