import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

// Services
import { InterestFineService } from '../interest-fine.service';

// Models
import { InterestFineView } from '../../../models/interest-fine.model';

@Component({
  selector: 'app-interest-for-debt-logs',
  templateUrl: './interest-fine-logs.component.html',
  styleUrls: ['./interest-fine-logs.component.scss']
})
export class InterestFineLogsComponent implements OnInit, OnDestroy {

  communityId: number;
  data: any[] = [];
  isLoading: Boolean = false;
  componentDestroyed: Subject<boolean> = new Subject();
  listInterestDebt: any[];

  constructor(private _interestForDebtService: InterestFineService,
              private _translateService: TranslateService,
              private _toasterService: ToasterService) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.isLoading = true;
    const getHistorytInterestDebt = this._interestForDebtService.getInterestFine(this.communityId, false);
    Observable.forkJoin(
      getHistorytInterestDebt)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          // recuperamos configuración de interés actual (de existir)
          const configurationGroup = data[0].json();
          if (configurationGroup.length > 0) {
            const list = [];
            configurationGroup.forEach(interest => {
              list.push(new InterestFineView(interest));
            });
            this.data = list;
          }
          this.isLoading = false;
        },
        error => {
          const RESPONSE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', RESPONSE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[RESPONSE_ERROR_MESSAGE]);
            });
          this.isLoading = false;
        });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

}
