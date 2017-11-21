import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  OnChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Injectable, Injector } from '@angular/core';

// Services
import { HelperService } from '../../../services/helpers.service';
import { AccoutingAccountService } from '../../../services/accouting-account.service';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { ExpenseService } from './../../../expense/expense.service';

// Models
import { Account } from '../../../models/account.model';
import { Sector } from '../../../models/sector.model';
import { Period } from '../../../models/period.model';

@Component({
  selector: 'app-expense-assign',
  templateUrl: './expense-assign.component.html',
})
export class ExpanseAssignComponent implements OnInit, OnDestroy, OnChanges {
  @Input('expensesAssignForm') expensesAssignForm: FormGroup;
  @Input('periodCurrentSetting') periodCurrentSetting: string;
  @Input('sectors') sectors: Sector[];
  @Input('expenseAmount') expenseAmount: number;
  @Input('countFees') countFees: number = null;
  @Input('expensesForm') expensesForm: FormGroup;
  @Input('periods') periods: Period[];
  @Input('edit') edit: Boolean = false;
  @Output() ouputStateForm = new EventEmitter();
  @Output() ouputStateFormFees = new EventEmitter();
  @Output() ouputFormCountFees = new EventEmitter();
  @Output() ouputPeriod = new EventEmitter();
  amountLocal: number = 0;
  expensesAssignFormAux: FormGroup;
  porcentFee: number;
  amountFee: number;
  lastFeePorcent: number = 0;
  lastFeeAmount: number = 0;
  componentDestroyed: Subject<boolean> = new Subject();
  notificationAlert: Boolean = false;
  accounts: Account[];
  subAccounts: Account[];
  resultDifference: any = 0;
  amountFees: number;
  widthCustomSector: string;
  sumFees: number = 0;
  translation: TranslateService;
  missingKey: string;
  communityId: number;
  indexFee = 0;
  subscriptionStartEvaluation: Subscription;
  subscriptionStartFee: Subscription;
  color: string = '#f5f5f5 !important';
  feesCount: number;

  constructor(private _fb: FormBuilder,
              public _helperService: HelperService,
              private _accoutingAccountService: AccoutingAccountService,
              private toasterService: ToasterService,
              private translateService: TranslateService,
              private injector: Injector,
              private _expenseService: ExpenseService,
              private _translateService: TranslateService,
              private _toasterService: ToasterService) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    const form = this.expensesAssignForm.value;
    this.expensesAssignForm.controls['amount'].setValue(this.expenseAmount);
    if (this.countFees !== null && undefined && !this.edit) {
      this.expensesAssignForm.controls['feesCount'].setValue(this.countFees);
      // this.feeCount = this.countFees;
    }
    // const widthContentSectors = document.getElementById('content_sectors_title').offsetWidth;
    // this.widthCustomSector = ((widthContentSectors / this.sectors.length) - 3).toString();

    const getAccounts = this._accoutingAccountService.getAll(this.communityId);
    Observable.forkJoin(
      getAccounts.map(accounts => accounts.json() as Account[]))
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          this.accounts = data[0];
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
          if (this.accounts.length > 0 && this.edit !== true) {
            // this.accoutingAccountSelected = this.accounts[0].id;
            this.expensesAssignForm.controls['account_primary_id'].setValue(this.accounts[0].id);
            this.subAccounts = this.accounts[0].children;
            this.expensesAssignForm.controls['account_id'].setValue(this.subAccounts[0].id);
            // this.subAccoutingAccountSelected = this.subAccounts[0].id;
          }
          if (this.edit === true) {
            this.changeAccount();
          }
        },
        error => {
          const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
            });
        },
        () => {
          // complete
        });

    const formAssignments = this.expensesAssignForm.value;
    if (formAssignments.expense_fees.length === 0) {
      this.changeFeeCount(this.expensesAssignForm.value);
    }
    // oyente para evaluar montos de formulario
    this.subscriptionStartEvaluation = this._expenseService._notificationStartEvaluation$
      .subscribe(
        evalaution => {
          const expensesForm = this.expensesAssignForm.value;
          const fees = this.expensesAssignForm.controls['expense_fees'].value;
          this.validateAmountExpenseInFees(expensesForm.amount, fees);
        });
  }

  formatJson(json: any) {
    return JSON.stringify(json);
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges(changes: any) {
    // if (((this.feeCount !== this.countFees) || ((this.expenseAmount !== this.amountLocal) && (+this.expenseAmount) !== 0)) && (this.edit === false)) {
    if ((((+this.expensesAssignForm.controls['feesCount'].value) !== this.countFees) || ((this.expenseAmount !== this.amountLocal) && (+this.expenseAmount) !== 0)) && (this.edit === false)) {
      this.amountLocal = this.expenseAmount;
      // this.feeCount = this.countFees;
      this.expensesAssignForm.controls['feesCount'].setValue(this.countFees);
      this.changeFeeCount(this.expensesAssignForm.value);
    }
  }

  // añadir objeto dinamico al formulario
  addFee() {
    const control = <FormArray>this.expensesAssignForm.controls['expense_fees'];
    const addrCtrl = this.initFees(this.porcentFee, this.amountFee, this.expensesAssignForm.controls['id'] ? this.expensesAssignForm.controls['id'].value : null);
    control.push(addrCtrl);
  }

  initFees(porcent: number, amount: number, assignmentId?: number) {
    if (this.edit) {
      return this._fb.group({
        amount: [amount, Validators.required],
        description: '',
        number: [this.indexFee],
        period: '',
        expense_fee_sectors: this._fb.array([]),
        porcent: porcent,
        code: [''],
        id: null,
        position: null,
        periodState: false,
        expense_assignment_id: assignmentId
      });
    } else {
      return this._fb.group({
        amount: [amount, Validators.required],
        description: '',
        number: [this.indexFee],
        period: '',
        expense_fee_sectors: this._fb.array([]),
        porcent: porcent,
        code: [''],
        position: null,
        periodState: false
      });
    }
  }

  // cambio en cuotas de gasto
  changeFeeCount(formExpense: FormGroup) {
    if ((+this.expensesAssignForm.controls['feesCount'].value) > 0 && ((+this.expensesAssignForm.controls['feesCount'].value) < 61) && this.expenseCountFeeEditBlock((+this.expensesAssignForm.controls['feesCount'].value))) {
      if ((+this.expensesAssignForm.controls['feesCount'].value) === 0) {
        this.expensesAssignForm.controls['feesCount'].setValue(1);
      }
      this.calculateValueFee();
      this.removeAllFees(formExpense);
      this.renderComponentFee();
    } else {
      const key = '';
      this.translation = this.injector.get(TranslateService);
      this.missingKey = key;
      if (this.expenseCountFeeEditBlock((+this.expensesAssignForm.controls['feesCount'].value)) === false) {
        const result = this.translation.instant('EXPENSE.FEE.FEES_PAID', {key});
        this.toasterService.pop('warning', result);
        this.expensesAssignForm.controls['feesCount'].setValue((+this.expensesAssignForm.controls['expense_fees'].value.length));
      } else {
        const result = this.translation.instant('EXPENSE.FEE.OUT_OF_RANGE', {key});
        this.toasterService.pop('warning', result);
      }
    }
  }

  renderComponentFee() {
    const feesInForm = (+this.expensesAssignForm.controls['expense_fees'].value.length);
    this.sumFees = 0;
    const element = this.expensesAssignForm.controls['feesCount'].value;
    if (this.edit) {
      for (let _i = 0; _i < (+this.expensesAssignForm.controls['feesCount'].value - feesInForm); _i++) {
        if (_i === ((+this.expensesAssignForm.controls['feesCount'].value) - (feesInForm + 1)) && this.resultDifference !== 0) {
          this.porcentFee = this.lastFeePorcent;
          this.amountFee = this.lastFeeAmount;
        }
        this.sumFees = this.sumFees + this.amountFee;
        this.indexFee = (_i + 1);
        this.addFee();
      }
    } else {
      for (let _i = 0; _i < (+this.expensesAssignForm.controls['feesCount'].value); _i++) {
        if (_i === ((+this.expensesAssignForm.controls['feesCount'].value) - 1) && this.resultDifference !== 0) {
          this.porcentFee = this.lastFeePorcent;
          this.amountFee = this.lastFeeAmount;
        }
        this.sumFees = this.sumFees + this.amountFee;
        this.indexFee = (_i + 1);
        this.addFee();
      }
    }
  }


  // eliminamos elemento seleccionado
  removeFee(i: number) {
    let ctrl = <FormArray>this.expensesAssignForm.controls['expense_fees'];
    if (!this.edit) {
      ctrl.removeAt(i);
    } else {
      ctrl.value.forEach((fee, _index) => {
        const indexOf = ctrl.value.indexOf(fee);
        if (fee.periodState !== true) {
          ctrl.removeAt(indexOf);
          ctrl = ctrl;
        } else {
          this.feesCount = this.feesCount + 1;
        }
      });
    }
  }


  // eliminamos elementos de lista dinamica de objetos
  removeAllFees(formExpense: any) {
    const countFee = formExpense.expense_fees.length;
    if (countFee !== 0 && this.edit !== true) {
      for (let _i = countFee; _i >= 0; _i--) {
        this.removeFee(_i);
      }
    } else if (this.edit) {
      this.removeFee(null);
    }
  }

  // calculamos el valor por cuota según monto ingresado
  calculateValueFee() {
    if (this.expenseAmount !== undefined) {
      let amount;
      let fees;
      if (this.edit) {
        amount = this.expenseAmounFeeEdit();
        fees = this.expenseCountFeeEdit();
      } else {
        amount = this.expenseAmount;
        fees = (+this.expensesAssignForm.controls['feesCount'].value);
      }
      this.expensesAssignForm.controls['amount'].setValue(amount);
      if (fees > 0) {
        this.resultDifference = amount % fees;
        this.amountFee = (amount / fees);
        if (this.resultDifference !== 0) {
          this.amountFee = this.math10(this.amountFee, 1);
          this.porcentFee = ((this.amountFee / amount) * 100);
          this.lastFeeAmount = (amount - (this.amountFee * (fees - 1)));
          this.lastFeePorcent = ((this.lastFeeAmount / amount) * 100);
        } else {
          this.porcentFee = ((this.amountFee / amount) * 100);
        }
      }
    }
  }

  public expenseAmounFeeEdit(): number {
    let amount = 0;
    const amountAssign = (+this.expensesAssignForm.controls['amount'].value);
    const feesEdit = this.expensesAssignForm.controls['expense_fees'].value;
    feesEdit.forEach(fee => {
      if (!fee.periodState) {
        amount = amount + (+fee.amount);
      }
    });
    this.expenseAmount = (amountAssign - amount);
    return amount;
  }

  public expenseCountFeeEdit(): number {
    const feesEditCount = (+this.expensesAssignForm.controls['feesCount'].value);
    const feesEdit = this.expensesAssignForm.controls['expense_fees'].value;
    let numberFeesBlocked = 0;
    feesEdit.forEach(fee => {
      if (fee.periodState === true) {
        numberFeesBlocked = numberFeesBlocked + 1;
        const listFeeBlock = this.expensesAssignForm.controls['expense_fee_ids'].value;
        if (listFeeBlock.indexOf(fee.id) === -1) {
          listFeeBlock.push(fee.id);
        }
      }
    });
    let diffFees = feesEditCount - numberFeesBlocked;
    if (diffFees < 1) {
      diffFees = 1;
    }
    return diffFees;
  }

  public expenseCountFeeEditBlock(feesCount: number): Boolean {
    const feesEditCount = (+this.expensesAssignForm.controls['feesCount'].value);
    const feesEdit = this.expensesAssignForm.controls['expense_fees'].value;
    let numberFeesBlocked = 0;
    feesEdit.forEach(fee => {
      if (fee.periodState === true) {
        numberFeesBlocked = numberFeesBlocked + 1;
      }
    });
    if (feesCount > numberFeesBlocked) {
      return true;
    } else {
      return false;
    }
  }

  // validamos que los valores de las cuotas no sean superiores al del gasto
  validateAmountExpenseInFees(amountExpense: number, amountFees: any) {
    const amoutExpense = amountExpense;
    let amountFeesValue = 0;
    // evaluamos los valores
    for (const element of amountFees) {
      if (element.amount !== undefined) {
        amountFeesValue = amountFeesValue + element.amount;
      }
    }
    if (amountFeesValue > amoutExpense && amoutExpense !== 0) {
      this.notificationAlert = true;
    } else {
      this.notificationAlert = false;
    }
    console.log('validateAmountExpenseInFees()');
  }

  // actualizamos sub-cuentas según cuenta principal seleccioanda
  changeAccount() {
    this.accounts.forEach(account => {
      if ((+this.expensesAssignForm.controls['account_primary_id'].value) === account.id) {
        this.subAccounts = account.children;
        if (!this.edit) {
          this.expensesAssignForm.controls['account_id'].setValue(this.subAccounts[0].id);
        }
        // this.subAccoutingAccountSelected = this.subAccounts[0].id;
      }
    });
  }

  // redondear numero en decenas
  math10(value: number, exp: number) {
    return this.decimalAdjust('floor', value, exp);
  }

  // redondear según se necesite
  decimalAdjust(type, value, exp) {
    // Si el exp es indefinido o cero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o el exp no es un entero...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Cambio
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Volver a cambiar
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // ouput desde componente sectors
  ouputFormValid(estadoForm) {
    this.ouputStateForm.emit({
      estadoForm
    });
  }

  // ouput desde componente fee
  ouputFormValidFee(estadoForm) {
    this.ouputStateFormFees.emit({
      estadoForm
    });
  }

  // ouput periodo
  ouputPeriodSelected(state) {
    this.ouputPeriod.emit(state);
  }
}
