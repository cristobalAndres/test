import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { toasterConfig, bsdatepickerConfig } from '../../app.config';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';
import { Fund } from '../../models/fund.model';
import { MaskNumberFormat } from '../../mixing/number-format.mixing'

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { es } from 'ngx-bootstrap/locale';

defineLocale('es', es);

// Services
import { FundService } from '../fund.service';
import { AccoutingAccountService } from '../../services/accouting-account.service';

// Models
import { Bank } from '../../models/bank.model';
import { Sector } from '../../models/sector.model';
import { FundIncomeType } from '../../models/fund-income-type.model';
import { Account } from '../../models/account.model';
import * as moment from 'moment/moment'

@Component({
  selector: 'app-fund-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FundFormComponent implements OnInit, OnDestroy {

  public fundForm: FormGroup;
  public communityId: number;
  public supcription: Subscription;
  public fundId: number = 0;
  public fundEdit: Fund = new Fund;
  public banksAccount: Bank[] = [];
  public incomeType: FundIncomeType[] = [];
  public selectIncomeTypeFund: string;
  public dateNow = moment(new Date().toISOString()).format('YYYY-MM-DD');
  public sectors: Sector[] = [];
  public sectorsId: any[] = [];
  public selectedSectors: Sector[] = [];
  private componentDestroyed: Subject<boolean> = new Subject();
  public toasterConfig: ToasterConfig = toasterConfig;
  public fund: Fund;
  public accounts: Account[];
  public subAccounts: Account[];
  public isUploading: Boolean = false;
  public formValidate: Boolean = true;
  bsConfig: Partial<BsDatepickerConfig>;
  public selectedDate: Date = new Date();
  public maskCurrencFormat = MaskNumberFormat.currency;

  constructor(
              private _fundService: FundService,
              private _fb: FormBuilder,
              private _translateService: TranslateService,
              private _toasterService: ToasterService,
              private _routeParams: ActivatedRoute,
              private _route: Router,
              private _accoutingAccountService: AccoutingAccountService) {
    this.fundForm = _fb.group({
      name: [null, Validators.required],
      initial_amount: [null, Validators.required],
      initial_date: new Date(),
      bank_account_id: ['', Validators.required],
      fund_income_type_id: ['', Validators.required],
      sectors: _fb.array([]),
      amount: [null, Validators.required],
      active: false,
      accounting_account_id: null,
      account_primary_id: null
    });
    this.fund = new Fund;
  };

  ngOnInit() {
    this.bsConfig = Object.assign({}, bsdatepickerConfig);
    this.communityId = +localStorage.getItem('communityId');
    this.isUploading = true;
    this.selectIncomeTypeFund = '';

    const getBanks = this._fundService.getBankAccount(this.communityId);
    const getSectors = this._fundService.getSector(this.communityId);
    const getIncomeType = this._fundService.getIncomeTypeFund();
    const getAccounts = this._accoutingAccountService.getAll(this.communityId);
    Observable.forkJoin(
      getBanks.map(banks => banks.json() as Bank[]),
      getSectors.map(sectors => sectors.json() as Sector[]),
      getIncomeType.map(incomeTypes => incomeTypes.json() as FundIncomeType[]),
      getAccounts.map(accounts => accounts.json() as Account[]))
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          // recuperamos bancos
          this.banksAccount = data[0];
          // recuperamos sectores
          this.sectors = data[1];
          if (this.sectors) {
            this.sectors.forEach(sector => {
              sector.active = false;
            });
          }
          // recuperamos tipos de ingreso
          this.incomeType = data[2];
          // recuperamos cuentas contables
          this.accounts = data[3];
          const listAccounts = [];
          this.accounts.forEach(account => {
            if (account.children.length > 0) {
              account.children.forEach(subAccount => {
                if (subAccount.children.length > 0) {
                  listAccounts.push(subAccount);
                }
              });
            }
          });
          this.accounts = listAccounts;
          if (this.accounts.length > 0) {
            this.fundForm.controls['account_primary_id'].setValue(this.accounts[0].id);
            this.subAccounts = this.accounts[0].children;
            this.fundForm.controls['accounting_account_id'].setValue(this.subAccounts[0].id);
          }
          // ejecutamos detección de fundoa editar
          this.detectFundId();
          this.isUploading = false;
        },
        error => {
          const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
            });
          this.isUploading = false;
        });
  }

  // refresca select de sub-cuentas al momento de cambiar cuenta padre
  public changeAccount(): void {
    this.accounts.forEach(account => {
      if ((+this.fundForm.controls['account_primary_id'].value) === account.id) {
        this.subAccounts = account.children;
        this.fundForm.controls['accounting_account_id'].setValue(this.subAccounts[0].id);
      }
    });
  }

  // actualizamos formGroup formulario para edición
  public updateFormView(fund?: Fund): void {
    const form = this.fundForm;
    this.fundForm['controls'].name.setValue(fund.name);
    this.fundForm['controls'].initial_amount.setValue(fund.initial_amount);
    const dateForm = moment(this.fundForm['controls'].initial_date.value).format('YYYY-MM-DD');
    if (dateForm !== fund.initial_date) {
      this.fundForm['controls'].initial_date.setValue(moment(fund.initial_date).format('YYYY-MM-DD HH:mm'));
    }
    this.fundForm['controls'].bank_account_id.setValue(fund.bank_account.id);
    this.fundForm['controls'].fund_income_type_id.setValue(fund.fund_income_type);
    this.fundForm['controls'].active.setValue(fund.active);
    this.fundForm['controls'].amount.setValue(fund.amount);
    this.accounts.forEach(account => {
      const _indexAccounting = account.children.findIndex(s => s.id === fund.accounting_account_id);
      if (_indexAccounting !== -1) {
        this.fundForm['controls'].account_primary_id.setValue(account.id);
        this.subAccounts = account.children;
        this.fundForm['controls'].accounting_account_id.setValue(fund.accounting_account_id);
      }
    });
    this.fundForm['controls'].accounting_account_id.setValue(fund.accounting_account_id);
  }

  // detectamos si existe parametro para edición de fondo, de no existir id se crea nuevo fondo
  public detectFundId(): void {
    this.supcription = this._routeParams.params.subscribe(params => {
      if (params['id']) {
        this.fundId = +params['id']; // (+) converts string 'id' to a number
        this.getFundId(this.fundId);
      } else {
        this.fundId = 0;
      }
    });
  }

  // detecta cambios en checkbox de sectores
  public sectorChange(sector: any): void {
    const arreyDebt = this.fundForm.controls['sectors'].value;
    if (arreyDebt === []) {
      this.fundForm['controls'].sectors.value.push(sector.id);
    } else {
      const position = arreyDebt.indexOf(sector.id);
      if (position === -1) {
        sector.active = true;
        this.fundForm.controls['sectors'].value.push(sector.id);
      } else {
        sector.active = false;
        const ctrl = this.fundForm.controls['sectors'].value;
        ctrl.splice(position, 1);
        const _index = this.fundForm.controls['sectors'].value;
      }
    }
    this.validateSelectSector();
  }

  public validateSelectSector(): void {
    if (this.fundForm.controls['fund_income_type_id'].value.slug === 'INGRESOS_EXTERNOS') {
      this.formValidate = false;
    } else {
      const validateSectors = this.fundForm.controls['sectors'].value;
      if (validateSectors.length === 0) {
        this.formValidate = true;
        this._translateService.get(['GENERAL.INFORMATION_TITLE', 'FUND.FORM.MSG_ALERT_FUND_SELECTED'])
          .subscribe((translation: string) => {
            this._toasterService.pop('warning', translation['GENERAL.INFORMATION_TITLE'], translation['FUND.FORM.MSG_ALERT_FUND_SELECTED']);
          });
      } else {
        this.formValidate = false;
      }
    }
  }

  // trae fondo apra edición de existir parametro Id
  public getFundId(fundId: number): void {
    this._fundService.getFundById(this.communityId, fundId)
      .subscribe(
        fund => {
          if (fund) {
            this.fundEdit = fund.json();
            this.updateFormView(this.fundEdit);
            if (this.sectors) {
              this.sectors.forEach((sector, _index) => {
                const listSectors = this.fundForm.controls['sectors'].value;
                const element = this.sectors[_index];
                if (listSectors) {
                  if (listSectors.findIndex(f => f.id === element.id) === -1) {
                    this.sectors[_index].active = false;
                  } else {
                    this.sectors[_index].active = true;
                  }
                }
              });
            }
            this.fundEdit.sectors.forEach(sector => {
              this.fundForm['controls'].sectors.value.push(sector.id);
              const position = this.sectors.findIndex(s => s.id === sector.id);
              this.sectors[position].active = true;
            });
            const arreyDebt = this.fundForm.controls['sectors'].value;
            if (arreyDebt !== 0) {
              this.formValidate = false;
            }
          } else {
            this._translateService.get(['GENERAL.ERROR_TITLE', 'FUND.FORM.MSG_ERROR_GET'])
              .subscribe((translation: string) => {
                this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['FUND.FORM.MSG_ERROR_GET']);
              });
          }

        },
        error => {
          this._translateService.get(['GENERAL.ERROR_TITLE', 'FUND.FORM.MSG_ERROR_GET'])
            .subscribe((translation: string) => {
              this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['FUND.FORM.MSG_ERROR_GET']);
            });
        });
  }

  // validamos que porcentaje ingresado sea un valor correcto
  public validatePercent(amount: any): void {
    if (amount > 100 || amount < 1) {
      this.fundForm['controls'].amount.setValue(1);
      this._translateService.get(['GENERAL.INFORMATION_TITLE', 'FUND.FORM.MSG_ALERT_PERCENT'])
        .subscribe((translation: string) => {
          this._toasterService.pop('warning', translation['GENERAL.INFORMATION_TITLE'], translation['FUND.FORM.MSG_ALERT_PERCENT']);
        });
    }
  }

  // llama a función correspondiente, edición o creación de fondo
  public onSubmit(formData: any): void {
    if (this.fundId !== 0) {
      this.fundEditMethod(formData);
    } else {
      this.fundCreate(formData);
    }
  }

  // creación de fondo
  public fundCreate(formData: any) {
    this.isUploading = true;
    const fundIncomeTypeId = this.fundForm.controls['fund_income_type_id'].value;
    formData.fund_income_type_id = formData.fund_income_type_id.id;
    console.log('Data.initial_date:', formData.initial_date);
    formData.initial_date = moment(formData.initial_date).utc().format('YYYY-MM-DD HH:mm');
    this._fundService.createFund(formData, this.communityId)
      .subscribe(
        data => {
          if (data.ok) {
            this._translateService.get(['GENERAL.SUCCESS_TITLE', 'FUND.FORM.MSG_SUCCESS'])
              .subscribe((translation: string) => {
                this._toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['FUND.FORM.MSG_SUCCESS']);
              });
          } else {
            this._translateService.get(['GENERAL.ERROR_TITLE', 'FUND.FORM.MSG_ERROR'])
              .subscribe((translation: string) => {
                this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['FUND.FORM.MSG_ERROR']);
              });
          }
          setTimeout(() => {
            this._route.navigate(['/fund/list-funds']);
            this.isUploading = false;
          }, 3000);
        },
        error => {
          this._translateService.get(['GENERAL.ERROR_TITLE', 'FUND.FORM.MSG_ERROR'])
            .subscribe((translation: string) => {
              this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['FUND.FORM.MSG_ERROR']);
            });
          this.isUploading = false;
        });
  }

  // guarda cambios para edición de fondo
  public fundEditMethod(formData: any) {
    this.isUploading = true;
    formData.bank_account = {id: formData.bank_account_id};
    formData.fund_income_type = formData.fund_income_type_id;
    formData.initial_date = moment(formData.initial_date).format('YYYY-MM-DD');

    const incomeType = this.fundForm['controls'].fund_income_type_id.value;
    if (incomeType.slug === 'INGRESOS_EXTERNOS') {
      formData.sectors = [];
    }
    this._fundService.updateFund(formData, this.communityId, this.fundId)
      .subscribe(
        data => {
          if (data.ok) {
            this._translateService.get(['GENERAL.SUCCESS_TITLE', 'FUND.FORM.MSG_SUCCESS_EDIT'])
              .subscribe((translation: string) => {
                this._toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['FUND.FORM.MSG_SUCCESS_EDIT']);
              });
          } else {
            this._translateService.get(['GENERAL.ERROR_TITLE', 'FUND.FORM.MSG_ERROR_EDIT'])
              .subscribe((translation: string) => {
                this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['FUND.FORM.MSG_ERROR_EDIT']);
              });
          }
          this.isUploading = false;
        },
        error => {
          this._translateService.get(['GENERAL.ERROR_TITLE', 'FUND.FORM.MSG_ERROR_EDIT'])
            .subscribe((translation: string) => {
              this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['FUND.FORM.MSG_ERROR_EDIT']);
            });
          this.isUploading = false;
        });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }
}
