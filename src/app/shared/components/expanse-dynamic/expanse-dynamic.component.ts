import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { bsdatepickerConfig } from '../../../app.config';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/takeUntil';
import { MaskNumberFormat } from '../../../mixing/number-format.mixing';
// Services
import { HelperService } from '../../../services/helpers.service';
import { SuppliersService } from '../../../services/suppliers.service';
import { ExpensesTypesService } from '../../../services/expense-types.service';
import { ExpenseService } from '../../../expense/expense.service';
import { PeriodService } from '../../../services/period.service';

// Models
import { ExpenseType } from '../../../models/expense-type.model';
import { Supplier } from '../../../models/supplier.model';
import { Sector } from '../../../models/sector.model';
import { Period } from '../../../models/period.model';
import { AssignType } from '../../../models/assign-type.model';

// DataPicker
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { es } from 'ngx-bootstrap/locale';
defineLocale('es', es);


import * as moment from 'moment/moment';

@Component({
  selector: 'app-expense-dynamic',
  templateUrl: './expanse-dynamic.component.html',
})
export class ExpenseDynamicComponent implements OnInit, OnChanges {
  @Input('expensesForm') expensesForm: FormGroup;
  @Input('position') position: number;
  @Input('sectors') sectors: Sector[];
  @Input('title') title: string;
  @Input('assignmentTypeDefault') assignmentTypeDefault: AssignType;
  @Input('edit') edit: Boolean;
  @Input('periodInitSetting') periodInitSetting: string;
  @Input('periodCurrentSetting') periodCurrentSetting: string;
  @Output() ouputFees = new EventEmitter();
  @Output() ouputStateForm = new EventEmitter();
  @Output() ouputStateFormFees = new EventEmitter();
  @Output() ouputPeriod = new EventEmitter();
  assign: Boolean = false;
  typeDocuments: ExpenseType[];
  suppliers: Supplier[];
  providerSelected: number;
  typeDocumentSelected: number;
  assignSwitch: Boolean = false;
  componentDestroyed: Subject<boolean> = new Subject();
  expense_type: string;
  supplier_name: string;
  countFees: number = 1;
  periods: Period[];
  dateNow: string;
  bsConfig: Partial<BsDatepickerConfig>;
  now: Date = new Date;
  dateSelected: any = [new Date(Date.now()), new Date(this.now.getFullYear(), this.now.getMonth() + 1, 1)];
  dateSelectedInit: any = null;
  dateSelectedEnd: any = null;
  maskMaskNumberFormat = MaskNumberFormat;

  hasInitDate: boolean = false;
  hasEndDate: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _supplierService: SuppliersService,
    private _translateService: TranslateService,
    private _toasterService: ToasterService,
    private _expensesTypeService: ExpensesTypesService,
    private _expenseService: ExpenseService,
    private _periodService: PeriodService,
    public _helperService: HelperService) {
    this.dateNow = moment(new Date().toISOString()).format();
  }

  ngOnInit() {
    const periodInit = this.periodInitSetting;
    const datos = this.expensesForm;
    this.bsConfig = Object.assign({}, bsdatepickerConfig);
  }

  ngOnChanges(changes: any) {
    if (changes.periodInitSetting && changes.periodInitSetting.currentValue) {
      this.initView(changes.periodInitSetting.currentValue, changes.periodCurrentSetting.currentValue);
    }
  }

  checkDateValid(date): boolean {
    const result = (date !== null /* && this.readyToShow === true */) ? true : false;
    return result;
  };

  public initView(initPeriod: string, currentPeriod?: string): void {
    const getSuppliers = this._supplierService.getAll();
    const getExpensesTypes = this._expensesTypeService.getAll();
    const getPeriods = this._periodService.getFuturePeriods(currentPeriod ? moment(currentPeriod, 'YYYYMM').format() : this.dateNow, 60, this.edit ? (+moment(currentPeriod ? currentPeriod : this.dateNow, 'YYYYMM', true).format('YYYYMM')) - (+initPeriod) : null);
    Observable.forkJoin(
      getSuppliers.map(suppliers => suppliers.json() as Supplier[]),
      getExpensesTypes.map(expenseType => expenseType.json() as ExpenseType[]),
      getPeriods)
      .takeUntil(this.componentDestroyed)
      .subscribe(
      data => {
        const form = this.expensesForm.value;
        // recuperamos proveedores
        this.suppliers = data[0];
        if (this.suppliers) {
          if (!this.expensesForm.controls['supplier_id'].value) {
            if (this.edit) {
              this.expensesForm.controls['supplier_id'].setValue(this.expensesForm.controls['supplier'].value.id);
            } else {
              this.expensesForm.controls['supplier_id'].setValue(this.suppliers[0].id);
            }
          }
          this.changeSelectProvider();
        }
        // recuperamos tipos de gastos
        this.typeDocuments = data[1];
        if (this.typeDocuments) {
          if (!this.expensesForm.controls['expense_type_id'].value) {
            if (this.edit) {
              this.expensesForm.controls['expense_type_id'].setValue(this.expensesForm.controls['type'].value.id);
            } else {
              this.expensesForm.controls['expense_type_id'].setValue(this.typeDocuments[0].id);
            }
          }
          this.changeSelectTypeDocument();
        }
        this.periods = data[2];
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
        this.hasInitDate = this.expensesForm.controls['date'].value !== null ? true : false;
        this.hasEndDate = this.expensesForm.controls['expiration_date'].value !== null ? true : false;
      });
  }

  initAssign() {
    return this._fb.group({
      amount: [0, Validators.required],
      account_id: [0, Validators.required],
      account_primary_id: [0, Validators.required],
      expense_fees: this._fb.array([]),
      feesCount: 1,
      expense_assignment_type_id: this.assignmentTypeDefault.id
    });
  }

  // se encarga de renderizar componente FEE la cantidad de veces que corresponda según vista
  renderComponentFee() {
    this.addAssign();
  }

  // eliminamos elementos de lista dinamica de objetos
  removeAllFees(formExpense: any) {
    const countFee = formExpense.expense_assignments.length;
    if (countFee !== 0) {
      const promise = new Promise((resolve, reject) => {
        for (let _i = countFee; _i >= 0; _i--) {
          this.removeFee(_i);
        }
      });
      return promise;
    }
  }

  changeAmount() {
    const amount = (+this.expensesForm.controls['amount'].value);
    if (amount < 1) {
      this.expensesForm.controls['amount'].setValue(1);
    }
    if (this.assignSwitch === true) {
      this.removeAllFees(this.expensesForm.value);
      this.renderComponentFee();
    }
  }

  // detectamos cambio en switch asignación gasto
  changeAssign() {
    if (this.assign === false) {
      this.renderComponentFee();
    } else {
      this.removeAllFees(this.expensesForm.value);
    }
    this.assign = !this.assign;
  }

  // eliminamos elemento seleccionado
  removeFee(i: number) {
    const ctrl = <FormArray>this.expensesForm.controls['expense_assignments'];
    ctrl.removeAt(i);
  }

  // cambio en cuotas de gasto
  changeFeeCount() {
    if (this.assignSwitch === true) {
      this._expenseService.updateObservable(true, null);
    }
  }

  // añadir objeto dinamico al formulario
  addAssign() {
    const control = <FormArray>this.expensesForm.controls['expense_assignments'];
    const addrCtrl = this.initAssign();
    control.push(addrCtrl);
  }

  // cambios en select Provider
  changeSelectProvider() {
    for (const element of this.suppliers) {
      if (this.expensesForm.controls['supplier_id'].value.toString() === element.id.toString()) {
        this.supplier_name = element.name;
      }
    }
  }

  // cambios en select Provider
  changeSelectTypeDocument() {
    for (const element of this.typeDocuments) {
      if (this.expensesForm.controls['expense_type_id'].value.toString() === element.id.toString()) {
        this.expense_type = element.name;
      }
    }
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
