import { Component, OnInit, ViewChild } from '@angular/core';
import { SurchargeService } from '../surcharge.service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { PeriodPipe } from '../../pipes/period.pipe'
import { NumberFormatPipe } from '../../pipes/numberformat.pipe'
import * as moment from 'moment/moment';


@Component({
  selector: 'app-surcharge-list',
  templateUrl: './surcharge-list.component.html',
  styleUrls: ['./surcharge-list.component.scss']
})
export class SurchargeListComponent implements OnInit {
  filterQuery: '';
  data: any = [];
  communityId: number;
  deleteId: number = null;
  isLoading: boolean = false;
  surchargeDelete: any = null;
  deletedInfo = {
    id: '',
    name: '',
    monto: ''
  };

  constructor(private numberFormatPipe: NumberFormatPipe,
              private periodPipe: PeriodPipe,
              private _surchargeService: SurchargeService,
              private _translateService: TranslateService,
              public _toasterService: ToasterService,) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.getList()
  }

  formatDate(date: string): string {
    return moment(date).format('DD-MM-YYYY');
  }

  onAcceptDelete = () => {
    this.isLoading = true;
    this._surchargeService.delete(this.communityId, this.deleteId)
      .subscribe(
        (result) => {
          this.data = this.data.filter(x => x.id !== this.deleteId)
          this.isLoading = false;
          this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.DELETE'])
            .subscribe((translation: string) => {
              this._toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.DELETE']);
            });
        },
        error => {
          console.log('Error : ', error)
          this.isLoading = false;
        })
  }

  confirmDelete(id) {
    this.surchargeDelete = this.data.filter(x => x.id === id);
    this.deleteId = id;
    this.deletedInfo.id = this.surchargeDelete[0].id;
    this.deletedInfo.name = this.surchargeDelete[0].property_name;
    this.deletedInfo.monto = this.numberFormatPipe.transform(this.surchargeDelete[0].amount, {type: 'currency'});
  }

  cancelDelete() {
    this.deletedInfo.id = '';
    this.deletedInfo.name = '';
    this.deletedInfo.monto = '';
  }

  getList() {
    this.isLoading = true;
    this._surchargeService.getList(this.communityId)
      .subscribe(
        (result) => {
          this.isLoading = false;
          const list = result.json();
          list.forEach(item => {
            const row = item
            row.created_at_format = this.formatDate(row.created_at);
            this._translateService.get(this.periodPipe.transform(row.period, {type: 'month'}))
              .subscribe((translate) => {
                row.period_translate = translate + ' ' + this.periodPipe.transform(row.period, {type: 'year'});
                this.data.push(row);
              })
          })
        }, (error) => {
          this.isLoading = false;
        })
  }

}
