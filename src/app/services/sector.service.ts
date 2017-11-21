import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SectorService extends AppService {

  // Observable
  _sectorAlertResource = new BehaviorSubject<Boolean>(false);
  observableSectorAlert$ = this._sectorAlertResource.asObservable();

  // Observable Monto por sector
  _sectorAmountResource = new BehaviorSubject<number>(0);
  observableSectorAmount$ = this._sectorAmountResource.asObservable();

  // actualizamos valor, este valor se actualizará en todos los oyentes
  updateObservable(alert: Boolean) {
    this._sectorAlertResource.next(alert);
  }

  // actualizamos valor de monto para recalcular valores
  updateObservableAmount(amount: number) {
    this._sectorAmountResource.next(amount);
  }

  constructor(http: Http) {
    super(http);
  }

  getAll(community: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/sectors`;
    return this.get(this.endpoint);
  }

  getTypeFields(): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/sectors/field`;
    return this.get(this.endpoint);
  }

  post(communityId: number, sector: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${communityId}/sector`;
    return this.create(this.endpoint, sector);
  }
  getUnitsBySectors(community: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/sector/units`;
    return this.get(this.endpoint);
  }
}

