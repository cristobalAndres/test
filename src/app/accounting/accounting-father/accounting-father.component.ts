import { Component, OnInit, Output, Input, EventEmitter, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SectorService } from '../../services/sector.service';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { AccoutingAccountService } from '../../services/accouting-account.service';
import { ExpenseAccountingAccountChildrenComponent } from '../expense-accounting-account-children/expense-accounting-account-children.component';
import { HelperService } from '../../services/helpers.service';

@Component({
  selector: 'app-accounting-father',
  templateUrl: './accounting-father.component.html',
  styleUrls: ['./accounting-father.component.scss']
})
export class AccountingFatherComponent implements OnInit, OnChanges {

  // variables
  @ViewChild(ExpenseAccountingAccountChildrenComponent) accountChild: ExpenseAccountingAccountChildrenComponent;
  @Input('accountingForm') accountingForm: FormGroup;
  @Input('form') form: FormGroup;
  @Input('sectors') sectors: any;
  @Input('disableEdit') disableEdit: boolean = false;
  @Output() output = new EventEmitter();
  @Output() changeStatusActive = new EventEmitter();
  @Output() changeStatusActiveEdit = new EventEmitter();
  @Output() statusSelected = new EventEmitter();
  @Output() disabledAllFather = new EventEmitter();
  public communityId: number;
  public isUploading: boolean = false;
  public formActive: boolean = false;
  public code: number;
  public alias: string = '';
  public name: string = '';
  public parent_id: number;
  public showSpinner: boolean = false;
  public blockStatus: boolean = false;
  public statusEdit: boolean = false;
  public status: boolean = false;
  public changeSelectedChild: boolean = false;
  spinnerSectorFather: boolean = false;
  existAlias: boolean = false;
  aliasData = {
    alias: ''
  };
  editAlias = {
    id: 0,
    name: ''
  };
  disableEditChild: boolean = true;
  public accountingId: number = 30;
  public uid: number;

  constructor(private _accountingAccountService: AccoutingAccountService,
              private _translateService: TranslateService,
              private _toasterService: ToasterService,
              private _fb: FormBuilder,
              private _sectorService: SectorService,
              private _helperService: HelperService,) {
  }

  ngOnInit() {
    if (this.accountingForm) {
      this.accountingForm.controls['accounts'].value.forEach((account, _index) => {
        this.addAccount(account);
      });
    }
    this.sectors.forEach((sector) => {
      this.initFormSector(sector);
    });
    this.communityId = +localStorage.getItem('communityId');
  }

  ngOnChanges(changes: any) {
    this.statusEdit = changes.disableEdit.currentValue;

  }

  // añadir objeto dinamico al formulario
  addAccount(account: any) {
    const control = <FormArray>this.accountingForm.controls['children'];
    const addrCtrl = this.initChildren(account);
    control.push(addrCtrl);
  }

  initFormSector(sector) {
    const control = <FormArray>this.accountingForm.controls['sectors'];
    const addCtrl = this.initSectors(sector);
    control.push(addCtrl);
  }

  public renderChildrenAccountDown(accounting: any): void {
    this.accountingForm.controls['active'].setValue(!accounting.active);
    accounting.active = !accounting.active;
    this.statusEdit = false;
    this.status = false;
    this.changeSelectedChild = true;
    this.changeStatusActive.emit({
      accounting,
      status: accounting.active
    });
  }

  public editAccountingMaster(item: any) {
    this.editAlias = {
      id: item.id,
      name: item.name
    };
    this.formActive = true;
    this.blockStatus = true;
    this.disableEditChild = true;
    if (!item.active) {
      this.renderChildrenAccountDown(item);
    }
    this.statusSelected.emit(false);
    setTimeout(() => {
      this.accountChild.disabledBrother();
    }, 500);
  }

  public initChildren(accounting: any) {
    return this._fb.group({
      account_sectors: [accounting.account_sectors],
      alias: [accounting.alias, Validators.required],
      aliasAux: [accounting.alias, Validators.required],
      code: [accounting.code],
      id: [accounting.id],
      name: [accounting.name, Validators.required],
      paren_id: [accounting.parent_id],
      active: [false],
      status: [this.blockStatus],
      sectors: this._fb.array([])
    });
  }

  public initSectors(sector: any) {
    return this._fb.group({
      id: [sector.id],
      name: [sector.name],
      active: [false],
      slug: [sector.slug]
    });
  }

  ouputAdd(account): void {
    this.output.emit({
      account
    })
  }

  public validateAlias(alias: string, item: any) {
    if (alias.toLowerCase() !== item.alias.toLowerCase()) {
      const validateAliasEquals = this.pushSortArrayAlias(alias);
      this.existAlias = validateAliasEquals ? true : false;
    }
  }

  public pushSortArrayAlias(data: any) {
    const arrAux = [];
    this.form.value.map((c) => {
      arrAux.push(c.alias.toLowerCase());
    });
    return this._helperService.verifyStringsEquals(arrAux, data.toLowerCase());
  }

  public saveAccountingMaster(item: any) {
    this.aliasData.alias = this.accountingForm.controls['aliasAux'].value;
    this.showSpinner = true;
    this._accountingAccountService.updateAccountAlias(this.communityId, item.id, this.aliasData)
      .subscribe(response => {
        this.accountingForm.controls['alias'].setValue(this.aliasData.alias);
        this.showSpinner = false;
        this.formActive = false;
        this.blockStatus = false;
        this.disableEditChild = false;
        this.changeStatusActiveEdit.emit(false);
        this.statusSelected.emit(true);
        this.existAlias = false;
      }, error => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'ACCOUNTING_ACCOUNTS.MSG_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['ACCOUNTING_ACCOUNTS.MSG_ERROR']);
          });
      });
    this.accountChild.disabledBrother();
  }

  onBlockEditStatus(event) {
    this.statusEdit = event.status;
    this.disabledAllFather.emit(event.status);
  }

  outputFormSector(item: any) {
    this.spinnerSectorFather = true;
    const arrChild: any = {
      accounts: [],
      mandatory: item.estadoForm.active
    };
    this.accountingForm.controls['children'].value.map((child) => {
      arrChild.accounts.push(child.id);
    });
    this.setAllSectorsChild(arrChild, item.estadoForm.id, item.estadoForm)
  }

  public setAllSectorsChild(childs: any, sectorId: number, sector: any) {
    this._accountingAccountService.setAccontsSectorsBulk(this.communityId, sectorId, childs)
      .subscribe(response => {
        this.spinnerSectorFather = false;
        this.accountingForm.controls['children'].value.forEach((child, _index) => {
          child.sectors.forEach((sectors, _j) => {
            if (sectors.id === sector.id) {
              this.accountingForm['controls'].children['controls'][_index]['controls'].sectors['controls'][_j]['controls'].active.setValue(sector.active);
            }
          });
        });
      }, error => {
        console.log(error);
      })
  }

  public disableForm() {
    this.showSpinner = false;
    this.formActive = false;
    this.blockStatus = false;
    this.disableEditChild = false;
    this.changeStatusActiveEdit.emit(false);
    this.statusSelected.emit(true);
    this.existAlias = false;
    this.accountChild.disabledBrother();
    this.accountingForm.controls['aliasAux'].setValue(this.accountingForm.controls['alias'].value);
  }

}
