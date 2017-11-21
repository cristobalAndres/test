import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { BankAccountService } from '../../services/bank.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { toasterConfig, bsdatepickerConfig } from '../../app.config';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/takeUntil';

import { MaskNumberFormat } from '../../mixing/number-format.mixing';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { es } from 'ngx-bootstrap/locale';
defineLocale('es', es);
import * as moment from 'moment/moment'
import * as localForage from 'localforage';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  componentDestroyed: Subject<boolean> = new Subject();
  communityId: number;
  dateNow = moment(new Date().toISOString()).format('YYYY-MM-DD');
  formBankAccount: FormGroup;
  banks: any = [];
  bankAccountType: any = [];
  bsConfig: Partial<BsDatepickerConfig>;
  bankAccountId: number;
  selectedDate: Date = new Date();
  maskNumberFormat = MaskNumberFormat;
  

  constructor(
    private _fb: FormBuilder,
    private _routerNav: Router,
    private _route: ActivatedRoute,
    private _toasterService: ToasterService,
    private _translateService: TranslateService,
    private _bankAccountService: BankAccountService
  ) { }

  ngOnInit() {
    this.bsConfig = Object.assign({}, bsdatepickerConfig);
    this.communityId = +localStorage.getItem('communityId');

    const bankAccountTypes = this._bankAccountService.getBankAccountTypes();
    const banks = this._bankAccountService.getBankList()

    this.initFormReading();
    Observable.forkJoin(
      bankAccountTypes.map(row => row.json()),
      banks.map(row => row.json())
    )
      .takeUntil(this.componentDestroyed)
      .subscribe(
      result => {
        this.bankAccountType = result[0];
        this.banks = result[1];
        this._route.params.subscribe(params => {
          if (+params['id']) {
            this.bankAccountId = +params['id'];
            this.getData()
          }
        });
      },
      error => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
      }
      )
  }

  public initFormReading(): void {
    this.formBankAccount = this._fb.group({
      accountType: [null, Validators.required],
      bank: [null, Validators.required],
      accountNumber: [null, Validators.required],
      openingBalance: [null, Validators.required],
      openingDate: [null, Validators.required],
      executiveName: [null, Validators.required],
      executiveEmail: [null, Validators.required],
      executivePhone: [null, Validators.required],
      defaultAccount: [false, Validators.required],
    });
  }

  getData() {
    if (this.bankAccountId) {
      this._bankAccountService.getBankAccountById(this.bankAccountId)
        .subscribe(
        (result: any) => {
          const account = result.json();
          const accountType = this.bankAccountType.filter(item => item.id === account.bank_account_type_id);
          const bank = this.banks.filter(item => item.id === account.bank_id)

          this.formBankAccount.controls['accountType'].setValue(accountType[0]);
          this.formBankAccount.controls['bank'].setValue(bank[0]);
          this.formBankAccount.controls['accountNumber'].setValue(account.code);
          this.formBankAccount.controls['openingBalance'].setValue(account.initial_amount);
          this.formBankAccount.controls['openingDate'].setValue(account.initial_date);
          this.formBankAccount.controls['executiveName'].setValue(account.executive_name);
          this.formBankAccount.controls['executiveEmail'].setValue(account.executive_email);
          this.formBankAccount.controls['executivePhone'].setValue(account.executive_phone);
          this.formBankAccount.controls['defaultAccount'].setValue(account.active);
        },
        error => {
          this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
            .subscribe((translation: string) => {
              this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
            });
        }
        )
    }
  }

  onSave() {
    const form = this.formBankAccount.value;
    const data: any = {};
    data.bank_id = form.bank.id;
    data.code = form.accountNumber;
    data.active = form.defaultAccount;
    data.bank_account_type_id = form.accountType.id;
    data.initial_amount = form.openingBalance;
    data.initial_date = form.openingDate;
    data.community_id = this.communityId;
    data.active = true;
    data.executive_name = form.executiveName;
    data.executive_email = form.executiveEmail;
    data.executive_phone = form.executivePhone;

    if (this.bankAccountId) {
      this._bankAccountService.updateBankAccount(this.communityId, this.bankAccountId, data)
        .takeUntil(this.componentDestroyed)
        .subscribe(
        response => {
          this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this._toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
              setTimeout(() => {
                this._routerNav.navigate(['/bank-account/list']);
              }, 2000);
            });
        },
        error => {
          const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
            });
        });
    } else {
      this._bankAccountService.createBanksAccount(this.communityId, data)
        .takeUntil(this.componentDestroyed)
        .subscribe(
        response => {
          this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this._toasterService.pop('success',
                translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
              setTimeout(() => {
                this._routerNav.navigate(['/bank-account/list']);
              }, 2000);
            });
        },
        error => {
          const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
            });
        });
    }
  }

}
