import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';

// Services
import { FundService } from '../fund.service';

// Models
import { Fund } from '../../models/fund.model';

@Component({
  selector: 'app-list-fund',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  data: Fund[];
  communityId: number;
  componentDestroyed: Subject<boolean> = new Subject();
  isLoading: Boolean = true;
  filterQuery = '';
  public fundDeleteId: any;

  constructor(
    private _fundService: FundService,
    private _translateService: TranslateService,
    private _toasterService: ToasterService
  ) { }

  ngOnInit() {
    // inicialización de variables
    this.communityId = +localStorage.getItem('communityId');
    this.initServices();
  }

  // cambiamos estado de fondo seleccionado
  public switchState(fundId: number): void {
    this.isLoading = true;
    this._fundService.updateActive(this.communityId, fundId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
      response => {
        // mensaje de exito
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            this._toasterService.pop('success',
              translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
          });
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
        this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
          .subscribe((res: string) => {
            this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
          });
      },
      () => {
        // desactivar loading
        this.isLoading = false;
      });
  }

  public deleteFund(id: number) {
    this.fundDeleteId = id;
  }

  // eliminamos fondo seleccionado
  public deleteFundConfirm(fundId: number): void {
    this.isLoading = true;
    this._fundService.deleteFund(this.communityId, fundId)
      .subscribe(res => {
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            this._toasterService.pop('success',
              translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
          });
        this.initServices();
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
        let DELETE_ERROR_MESSAGE = '';
        switch (err.json().message) {
          case 'BILL_DEBTS_ASSOCIATED':
          DELETE_ERROR_MESSAGE = 'FUND.VALIDATION.BILL_DEBTS_ASSOCIATED';
          this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
            });
            break;
          case 'SURCHARGE_ASSOCIATED':
            DELETE_ERROR_MESSAGE = 'FUND.VALIDATION.SURCHARGE_ASSOCIATED';
            this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
              .subscribe((res: string) => {
                this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
              });
              break;
          default:
            DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
            this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
              .subscribe((res: string) => {
                this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
              });
            break;
        }
      });
  }

  // inicializamos data necesaria para funcionamiento de vista
  public initServices(): void {
    const getFunds = this._fundService.getFunds(this.communityId, true);
    // ejecución de observables necesarios para funcionamiento de vista
    getFunds
      .takeUntil(this.componentDestroyed)
      .subscribe(
      funds => {
        // recuperamos fondos
        this.data = funds.json().map((fund) => {
          fund.total_balance = fund.balance.active - fund.balance.passive;
          return fund;
        });
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
        this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
          .subscribe((res: string) => {
            this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
          });
      },
      () => {
        // desactivar loading
        this.isLoading = false;
      });
  }

}
