import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import * as moment from 'moment/moment';

// Models
import { MethodCalculate } from '../models/method-calculate.model';

@Injectable()
export class MethodsCalculateService {

  private methods = [
    { id: 1, name: 'División entre inmuebles', slug: 'PROPERTY_DIVISION' },
    { id: 2, name: 'Factor prorrateo recalculado', slug: 'PRORRATE' },
  ];

  constructor() { }

  // trae metodos
  getMethods(): Observable<MethodCalculate[]> {
    return Observable.create(observer => {
      observer.next(this.methods);
      observer.complete();
    });
  }

}
