import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_BULK_UPLOAD, BASE_URL_CRUD, BASE_URL_IMPORT } from '../app.service';
import { Observable } from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class CommunityImportService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getLog(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/event-logs/communities/${communityId}/import`;
    return this.get(this.endpoint);
  }

  acceptImport(uploadData: any, communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_IMPORT}/communities/${communityId}/upload/confirm/async`;
    return this.create(this.endpoint, JSON.stringify(uploadData));
  }

  cancelImport(uploadData: any, communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_IMPORT}/communities/${communityId}/upload/cancel`;
    return this.create(this.endpoint, JSON.stringify(uploadData));
  }

  uploadFile(formData: FormData, communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_IMPORT}/communities/${communityId}/upload?showPreview=true`;
    return this.upload(this.endpoint, formData);
  }

  isProcessing(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_BULK_UPLOAD}/import-community/communities/${communityId}/status`;
    return this.http.get(this.endpoint);
  }
}
