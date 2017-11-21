import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment/moment'
import { Bank } from '../models/bank.model';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { BankService } from './bank.service';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss']
})
export class BankComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  public data: Bank[];
  public filterQuery = '';

  constructor(private _bankService: BankService) {
  }

  ngOnInit(): void {
    this.getAll();
  }

  getAll(): void {
    this._bankService.all()
      .takeUntil(this.componentDestroyed)
      .subscribe(
      data => this.data = data.json() as Bank[]
      );
  }

  // formateo de fecha en vista
  formatDate(date: string): string {
    return moment(date).format('DD-MM-YYYY');
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

}
