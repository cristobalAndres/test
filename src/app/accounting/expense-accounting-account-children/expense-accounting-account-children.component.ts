import {Component, Input, OnInit, Output, EventEmitter, OnChanges} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import 'rxjs/add/operator/takeUntil';

// Services
import { AccoutingAccountService } from '../../services/accouting-account.service';
import { HelperService } from '../../services/helpers.service';

@Component({
  selector: 'app-expense-accounting-account-children',
  templateUrl: './expense-accounting-account-children.html',
  styleUrls: ['./expense-accounting-account-children.scss']
})
export class ExpenseAccountingAccountChildrenComponent implements OnInit, OnChanges{
  @Input('accountingForm') accountingForm: FormGroup;
  @Input('form') form: FormGroup;
  @Input('sectors') sectors: any;
  @Input('disableEditChild') disableEditChild: boolean = false;
  @Input('blockStatus') blockStatus: boolean = false;
  @Input('status') status: boolean = false;
  @Input('statusSelected') statusSelected: boolean = true;
  @Input('sectorsFather') sectorsFather: any;
  @Output() blockEditStatus = new EventEmitter();
  @Output() disableCheck = new EventEmitter();
  @Input('changeSelectedChild') changeSelectedChild: any;
  aliasData = {};
  editAlias = { id: null };
  formActive = false;
  public accountingId: number;
  public communityId: number;
  public accountId;
  public showSpinner: boolean = false;
  public showSpinnerBig: boolean = false;
  statusSector: boolean = false;
  existAlias: boolean = false;
  constructor(private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _toasterService: ToasterService, private _helperService: HelperService,
    private _accountingAccountService: AccoutingAccountService
  ) { }
  ngOnInit() {
    const data = this.accountingForm;
    this.communityId = +localStorage.getItem('communityId');

    if (this.sectors && this.sectors.length > this.accountingForm.controls['sectors'].value.length) {
      this.sectors.forEach((sector, _index) => {
        if (this.accountingForm.value.account_sectors) {
          this.statusSector = this.accountingForm.value.account_sectors.find((as) => {
            if (as.sector_id === sector.id) {
              return as.mandatory;
            } else {
              return false;
            }
          })
        }
        this.initFormSector(sector, this.statusSector);
      });
    }
  }

  ngOnChanges(changes: any) {
    if (changes.status) {
      this.accountingForm.controls['status'].setValue(changes.status.currentValue);
    }
  }

  editAccountingChild(item: any) {
    console.log(item, 'hijo');
    this.editAlias = { id: item.id };
    this.formActive = true;
    this.blockEditStatus.emit({ status: true });
    this.disableCheck.emit({ status: true });
    this.disabledBrother();
  }

  public disabledBrother() {
    const form = this.accountingForm.value;
    const brothers = this.form.value;
    brothers.forEach((account, _index) => {
      account.children.forEach((child, _j) => {
        this.form['controls'][_index]['controls'].children['controls'][_j]['controls'].status.setValue(!this.form['controls'][_index]['controls'].children['controls'][_j]['controls'].status.value);
      })
    })
  }
  public disabledSelected() {
    const brothers = this.form.value;
    brothers.forEach((account, _index) => {
      account.children.forEach((child, _j) => {
        if (!this.form['controls'][_index]['controls'].children['controls'][_j]['controls'].status.value) {
          this.form['controls'][_index]['controls'].children['controls'][_j]['controls'].status.setValue(false);
        }
      })
    })
  }

  updateAccountingChild(item: any) {
    this.aliasData = { alias: this.accountingForm.controls['aliasAux'].value };
    this.showSpinner = true;
    this._accountingAccountService.updateAccountAlias(this.communityId, item.id, this.aliasData).subscribe(response => {
      this.formActive = false;
      this.showSpinner = false;
      this.blockEditStatus.emit({ status: false });
      this.disableCheck.emit({ status: false });
      this.existAlias = false;
      this.accountingForm.controls['alias'].setValue(this.accountingForm.controls['aliasAux'].value);
    }, error => {
      this._translateService.get(['GENERAL.ERROR_TITLE', 'ACCOUNTING_ACCOUNTS.MSG_ERROR'])
        .subscribe((translation: string) => {
          this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['ACCOUNTING_ACCOUNTS.MSG_ERROR']);
        });
    });
    this.disabledBrother();
  }

  initFormSector(sector, account_sector_active) {
    const control = <FormArray>this.accountingForm.controls['sectors'];
    const addCtrl = this.initSectors(sector, account_sector_active);
    control.push(addCtrl);
  }

  changeSector(item: any) {
    this.accountingId = item.id;
    this.accountingForm.controls['active'].setValue(!item.active);
  }
  initSectors(sector: any, accounts_sectors: any) {
    return this._fb.group({
      id: [sector.id],
      name: [sector.name],
      active: [accounts_sectors],
      slug: [sector.slug]
    });

  }
  outputFormSector(estadoForm): void {
    if (estadoForm.account_id) {
      this.accountId = estadoForm.account_id;
    }
    this.showSpinnerBig = true;
    this._accountingAccountService.setAccountOnSector(this.communityId, this.accountId, estadoForm.estadoForm.id, { mandatory: estadoForm.estadoForm.active })
      .subscribe((e) => {
        this.showSpinnerBig = false;
        console.log(e);
      }, error => {
        console.log(error);
      });
  }

  cancelEditChild() {
    this.formActive = false;
    this.showSpinner = false;
    this.blockEditStatus.emit({ status: false });
    this.disableCheck.emit({ status: false });
    this.existAlias = false;
    this.disabledBrother();
    this.accountingForm.controls['aliasAux'].setValue(this.accountingForm.controls['alias'].value);
  }

  validateAlias(alias: string, item: any) {
    if (alias.toLowerCase() !== item.alias.toLowerCase()) {
      const validateAliasEquals = this.pushSortArrayAlias(alias, item);
      this.existAlias = validateAliasEquals ? true: false;
    }
  }

  public pushSortArrayAlias(data: any, item: any) {
    const arrAux = [];
    this.form.value.map((c) => {
      if (item.paren_id === c.id) {
        c.children.forEach((d) => {
          arrAux.push(d.alias.toLowerCase());
        });
      }
    });
    return this._helperService.verifyStringsEquals(arrAux, data.toLowerCase());
  }
}
