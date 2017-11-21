import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import * as moment from 'moment/moment';

// Models
import { Period } from '../models/period.model';

@Injectable()
export class PeriodService {

  private months = [
    { number: 1, name: 'JANUARY' },
    { number: 2, name: 'FEBRUARY' },
    { number: 3, name: 'MARCH' },
    { number: 4, name: 'APRIL' },
    { number: 5, name: 'MAY' },
    { number: 6, name: 'JUNE' },
    { number: 7, name: 'JULY' },
    { number: 8, name: 'AUGUST' },
    { number: 9, name: 'SEPTEMBER' },
    { number: 10, name: 'OCTOBER' },
    { number: 11, name: 'NOVEMBER' },
    { number: 12, name: 'DECEMBER' },
  ];

  constructor() { }

  getPeriodMonth(period: string): Observable<any> {
    const periodObj = this.createPeriod(period);
    const month = this.months.find(x => x.number === periodObj.month);
    return Observable.of(month);
  }

  getPeriodObject(period: string): Observable<any> {
    const periodObj = this.createPeriod(period);
    return Observable.of(periodObj);
  }

  getPeriodString(period: string): Observable<any> {
    const periodObj = this.createPeriod(period);
    const periodString = `${periodObj.monthName} ${periodObj.year}`;
    return Observable.of(periodString);
  }

  getMonths(): Observable<any> {
    return Observable.of(this.months);
  }

  getYears(period: string, firstPeriod: string): Observable<any> {
    const periodObj = this.createPeriod(period);
    const firstPeriodObj = this.createPeriod(firstPeriod);
    const years = [];
    for (let year = firstPeriodObj.year; year <= periodObj.year + 3; year++) {
      years.push(year);
    }
    return Observable.of(years);
  }

  getFirstToCurrent(firstPeriod: string, currentPeriod: string) {
    const periods = [];
    const _firstPeriod = moment(firstPeriod + '01')
    let _currentPeriod = moment(currentPeriod + '01')
    while (_currentPeriod >= _firstPeriod) {
      const month = this.months.find(x => x.name === _currentPeriod.format('MMMM').toUpperCase());
      const objectPeriod = new Period();
      objectPeriod.name = month.name;
      objectPeriod.number = month.number;
      objectPeriod.periodGroup = (+_currentPeriod.format('YYYY'));
      objectPeriod.period = (+_currentPeriod.format('YYYYMM'));
      periods.push(objectPeriod);
      _currentPeriod = _currentPeriod.subtract(1, 'month')
    }
    return Observable.of(periods);
  }


  getFuturePeriods(period: string, future: number = 12, past: number = 0): Observable<any> {
    const periods = [];
    const end = moment(period).add(future, 'month').format('YYYYMM');
    let init;
    if (past) {
      init = moment(period).subtract(past, 'month').format('YYYYMM');
    } else {
      init = moment().month(period).format('YYYYMM');
    }
    for (let _period = (-past); _period < future; _period++) {
      const month = this.months.find(x => x.name === moment(period).add(_period, 'month').format('MMMM').toUpperCase());
      const objectPeriod = new Period();
      objectPeriod.name = month.name;
      objectPeriod.number = month.number;
      objectPeriod.periodGroup = (+moment(period).add(_period, 'month').format('YYYY'));
      objectPeriod.period = (+moment(period).add(_period, 'month').format('YYYYMM'));
      periods.push(objectPeriod);
    }
    return Observable.of(periods);
  }

  private createPeriod(period: string): any {
    period = this.removeSlashFromPeriod(period);
    const monthStr = period.slice(4, 6);
    return {
      year: +period.slice(0, 4),
      month: +monthStr,
    };
  }

  private removeSlashFromPeriod(period: string): string {
    return period.replace('-', '');
  }
}
