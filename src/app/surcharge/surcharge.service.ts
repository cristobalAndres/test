import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD, BASE_URL_BULK_UPLOAD } from '../app.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class SurchargeService extends AppService {

  constructor(http: Http) {
    super(http);
  }

  getList(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/surcharge/list`;
    return this.get(this.endpoint);
  }
  delete(communityId: number, surchargeId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/surcharge/${surchargeId}`;
    return this.remove(this.endpoint)
  }

  postCreateCategorySurcharge(formData: FormData, communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/surcharge/category`;
    return this.create(this.endpoint, formData);
  }

  uploadFile(formData: FormData, communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_BULK_UPLOAD}/communities/${communityId}/surcharge/read-xlsx`;
    return this.upload(this.endpoint, formData);
  }

  createConfirm(communityId: number, data: any): Observable<Response> {
    this.endpoint = `${BASE_URL_BULK_UPLOAD}/communities/${communityId}/surcharge/confirm`;
    return this.create(this.endpoint, data)
  }

  getIsProcessActive(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_BULK_UPLOAD}/communities/${communityId}/surcharge/status`;
    return this.get(this.endpoint);
  }

  getCategory(communityId: number, delflag: boolean = false): Observable<Response> {
    if (delflag) {
      this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/surcharge-category?delete=true`;
    } else {
      this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/surcharge-category`;
    }
    return this.get(this.endpoint);
  }

  deleteCategory(communityId: number, surchargeCategoryId: number ): Observable<Response>  {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/surcharge/category/${surchargeCategoryId}`;
    return this.remove(this.endpoint);
  }

  getTypes(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/surcharge/type`;
    return this.get(this.endpoint);
  }

  getFunds(communityId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/funds`;
    return this.get(this.endpoint);
  }
}
