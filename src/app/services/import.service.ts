import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_BULK_UPLOAD, BASE_URL_CRUD, BASE_URL_INITIAL_BALANCE, BASE_URL_REPORT } from '../app.service';
import { Observable } from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class InitialBalanceImportService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getLog(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/event-logs/communities/${communityId}/initial-balance`;
    return this.get(this.endpoint);
  }

  acceptImport(uploadData: any, communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_BULK_UPLOAD}/initial-balance/communities/${communityId}/confirm`;
    return this.create(this.endpoint, JSON.stringify(uploadData));
  }

  cancelImport(uploadData: any, communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_INITIAL_BALANCE}/communities/${communityId}/initial-balance/upload/cancel`;
    return this.create(this.endpoint, JSON.stringify(uploadData));
  }

  uploadFile(formData: FormData, communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_INITIAL_BALANCE}/communities/${communityId}/initial-balance/upload?showPreview=true`;
    return this.upload(this.endpoint, formData);
  }

  isProcessing(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_BULK_UPLOAD}/initial-balance/communities/${communityId}/status`;
    return this.http.get(this.endpoint);
  }

  generateXLSX(communityId: number): Observable<Response> {
    const data = {
      template: {
        shortid: 'H14t4M_E-'
      },
      data: {
        community_id: communityId
      }
    };
    this.endpoint = BASE_URL_REPORT;
    // return this.create(this.endpoint, data);
    return this.generate(this.endpoint, data);
  }
}
