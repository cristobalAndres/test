import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
// Services
import { AccoutingAccountService } from '../../services/accouting-account.service';
import { SectorService } from '../../services/sector.service';
import { HelperService } from '../../services/helpers.service';
// Models
import { Account } from '../../models/account.model';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/forkJoin';
import { Sector } from '../../models/sector.model';

@Component({
  selector: 'app-expense-accounting-account',
  templateUrl: './expense-accounting-account.component.html',
  styleUrls: ['./expense-accounting-account.component.scss'],
})
export class ExpenseAccountingAccountComponent implements OnInit {
  public accountingForm: FormGroup;
  public newForm: FormGroup;
  public communityId: number;
  public isUploading: boolean = false;
  public expenseAccountingAccount: Account[];
  public formActive: boolean = false;
  public renderAll: boolean = true;
  public code: number;
  public alias: string = '';
  public name: string = '';
  public parent_id: number;
  public sectors: any;
  disabledEdit: boolean = false;
  aliasData = {};
  editAlias = {
    id: 0,
    name: ''
  };
  create: boolean = false;
  accountingsChildren: any;
  existAlias: boolean = false;
  public accountSelected: any;


  constructor(private _accountingAccountService: AccoutingAccountService,
              private _translateService: TranslateService,
              private _toasterService: ToasterService,
              private _fb: FormBuilder,
              private _sectorService: SectorService,
              private _helperService: HelperService,) {
  }

  ngOnInit() {
    this.accountingsChildren = this._fb.array([]);
    this.accountingForm = this._fb.group({
      accountings: this._fb.array([]),
      alias: [null, Validators.required],
      aliasAux: [null],
    });
    this.newForm = this._fb.group({
      name: [null, Validators.required],
    });
    this.communityId = +localStorage.getItem('communityId');
    this.getExpenseAccountingAccount(this.communityId);
  }

  // traemos cuentas contables de gasto
  public getExpenseAccountingAccount(communityId: number): void {
    this.isUploading = true;
    const getSectors = this._sectorService.getAll(this.communityId);
    const getAccount = this._accountingAccountService.getAllWithSctors(communityId);
    Observable.forkJoin(
      getSectors.map(sectors => sectors.json() as Sector[]),
      getAccount.map(account => account.json())
    ).subscribe((res) => {
      this.sectors = res[0];
      this.expenseAccountingAccount = res[1][0].children;
      this.expenseAccountingAccount.forEach(account => {
        this.initChildrens(account);
      });
      this.isUploading = false;
    }, error => {
      this._translateService.get(['GENERAL.ERROR_TITLE', 'ACCOUNTING_ACCOUNTS.MSG_ERROR'])
        .subscribe((translation: string) => {
          this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['ACCOUNTING_ACCOUNTS.MSG_ERROR']);
        });
      this.isUploading = false;
    });
  }

  // dibujamos las cuentas que corresponda, según estado de collapsable global
  public renderChildrenAccountAll(): void {
    this.renderAll = !this.renderAll;
    this.expenseAccountingAccount.forEach(account => {
      account.active = !account.active;
    });

  }

  public initChildrens(accounting: any) {
    const control = <FormArray>this.accountingForm.controls['accountings'];
    this.accountingsChildren = [];
    const addCtrl = this.initChildren(accounting);
    control.push(addCtrl);
  }

  public initChildren(accounting: any) {
    return this._fb.group({
      alias: [accounting.alias, Validators.required],
      aliasAux: [accounting.alias, Validators.required],
      children: this._fb.array([]),
      sectors: this._fb.array([]),
      id: [accounting.id],
      code: [accounting.code],
      name: [accounting.name, Validators.required],
      paren_id: [accounting.parent_id],
      accounts: [accounting.children],
      active: [true],
      status: [true]
    });
  }

  public ouputAdd(account): void {
    this.accountSelected = account;
    const btn = document.getElementById('modalView');
    btn.click();
  }

  // añadir objeto dinamico al formulario
  addAccountChildren(alias: any, position: number) {
    const control = <FormArray>this.accountingForm.controls['accountings'];
    const controls2 = control['controls'][position]['controls'].children;
    const addrCtrl = this.initChildrenEmpty(alias);
    controls2.push(addrCtrl);
  }

  public initChildrenEmpty(alias: any) {
    return this._fb.group({
      account_sectors: [],
      alias: [alias.alias, Validators.required],
      aliasAux: [alias.alias, Validators.required],
      code: [alias.code],
      id: [alias.id],
      name: [alias.name],
      paren_id: [alias.parent_id],
      active: [alias.active],
      sectors: this._fb.array([]),
      status: [alias.status]
    });
  }

  public validateAlias(data: any) {
    const validateAliasEquals = this.pushSortArrayAlias(data);
    if (validateAliasEquals) {
      this.existAlias = true;
    } else {
      this.existAlias = false;
    }
  }

  public sendAccount(data: any): void {
    const selected = this.accountSelected.account;
    this._accountingAccountService.createAccountChildren(this.communityId, selected.id, data).subscribe(response => {
      data = {
        alias: response.json().alias,
        name: false,
        code: response.json().code,
        active: false,
        parent_id: response.json().parent_id,
        id: response.json().id,
        status: false
      }
      const accounts = this.accountingForm.value;
      const _index = accounts.accountings.indexOf(selected);
      if (_index !== -1) {
        this.addAccountChildren(data, _index);
      }
      this._translateService.get(['GENERAL.CONFIRMATION_TITLE', 'ACCOUNTING_ACCOUNTS.MSG_SUCCESS'])
        .subscribe((translation: string) => {
          this._toasterService.pop('success', translation['GENERAL.CONFIRMATION_TITLE'], translation['ACCOUNTING_ACCOUNTS.MSG_SUCCESS']);
        });
    }, error => console.log(error))
  }

  public pushSortArrayAlias(data: any) {
    const arrAux = [];
    this.accountSelected.account.children.map((c) => {
      arrAux.push(c.alias.toLowerCase());
    });
    return this._helperService.verifyStringsEquals(arrAux, data.toLowerCase());
  }

  public outputStatusCheck(item: any) {
    console.log(item);
    this.accountingForm.controls['accountings'].value.forEach((account, _index) => {
      this.accountingForm['controls'].accountings['controls'][_index]['controls'].status.setValue(item)
    });
  }

  public outputChangeStatusActiveedit(item) {
    this.disabledEdit = item;
  }

  public outputStatusSelected(item) {
    this.accountingForm.controls['accountings'].value.forEach((account, _index) => {
      this.accountingForm['controls'].accountings['controls'][_index]['controls'].status.setValue(item)
    });
  }

  public outputDisabledAllFathers(item) {
    this.accountingForm.controls['accountings'].value.forEach((account, _index) => {
      this.accountingForm['controls'].accountings['controls'][_index]['controls'].status.setValue(!item)
    });
  }
}
