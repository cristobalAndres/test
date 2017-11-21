import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_BULK_UPLOAD, BASE_URL_CRUD, BASE_URL_INITIAL_BALANCE, BASE_URL_REPORT } from '../../app.service';
import { Observable } from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class UploadControlService extends AppService {
  constructor(http: Http) {
    super(http);
  }

  generateXLSX(communityId: number, shortid: string): Observable<Response> {
    const data = {
      template: {
        shortid: shortid
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
