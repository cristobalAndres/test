import { Component, OnInit } from '@angular/core';
import { BankAccountService } from '../services/bank.service';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import * as localForage from 'localforage';
import { toasterConfig } from '../app.config';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';
@Component({
  selector: 'app-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.scss']
})
export class BankAccountComponent implements OnInit {
  public communityId: number;
  public isLoading: Boolean = true;
  public bankAccountId: number;
  public itemSelected: any;
  data: any;
  filterQuery = '';

  constructor(private _bankAccountService: BankAccountService,
    private _translateService: TranslateService,
    private _toasterService: ToasterService) { }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.initServices();
  }

  public initServices(): void {
    const getBankAccount = this._bankAccountService.all(this.communityId);
    // ejecución de observables necesarios para funcionamiento de vista
    getBankAccount
      .subscribe(
      bankAccount => {
        this.data = bankAccount.json();
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

  public selectBankAccount(item: any) {
    this.bankAccountId = item.id;
    this.itemSelected = item;
  }

  cancelModalChageDefault() {
    this.itemSelected.is_default = !this.itemSelected.is_default;
  }

  changeDefault(id: number): void {
    this.isLoading = true;
    const changeDefault = this._bankAccountService.changeDefaultBankAccount(this.communityId, id);
    // ejecución de observables necesarios para funcionamiento de vista
    changeDefault
      .subscribe(
      bankAccount => {
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.MODIFICATION'])
        .subscribe((translation: string) => {
          this._toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.MODIFICATION']);
        });
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
        this.initServices()
        this.isLoading = false;
      });
  }

  deleteBankAccount(id: number): void {
    const getBankAccount = this._bankAccountService.deleteBankAccount(this.communityId, id);
    // ejecución de observables necesarios para funcionamiento de vista
    getBankAccount
      .subscribe(
        data => {
          this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.DELETE'])
          .subscribe((translation: string) => {
            this._toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.DELETE']);
          });
          this.data = this.data.filter(x => x.id !== this.bankAccountId);
        }, error => {
          let DELETE_ERROR_MESSAGE = '';
          switch (error.json().message) {
            case 'PAYMENT_ASSOCIATED':
            DELETE_ERROR_MESSAGE = 'PAYMENT.NOTIFICATION.PAYMENT_ASSOCIATED';
            this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
              .subscribe((res: string) => {
                this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
              });
              break;
            case 'CHECKBOOK_ASSOCIATED':
              DELETE_ERROR_MESSAGE = 'PAYMENT.NOTIFICATION.CHECKBOOK_ASSOCIATED';
              this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
                .subscribe((res: string) => {
                  this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
                });
                break;
            case 'FUND_ASSOCIATED':
              DELETE_ERROR_MESSAGE = 'PAYMENT.NOTIFICATION.FUND_ASSOCIATED';
              this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
                .subscribe((res: string) => {
                  this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
                });
                break;
            case 'OUTCOME_ASSOCIATED':
              DELETE_ERROR_MESSAGE = 'PAYMENT.NOTIFICATION.OUTCOME_ASSOCIATED';
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
        })
  }

}
