import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { toasterConfig } from '../../app.config';
import { Injector } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/forkJoin';
import * as moment from 'moment/moment'

// Services
import { ExpenseService } from './../expense.service';
import { SectorService } from '../../services/sector.service';
import { AssignmentsTypeService } from '../../services/assignment-type.service';
import { PeriodService } from '../../services/period.service';
import { SettingsService } from '../../services/settings.service';

// Model
import { ExpenseAssign, ExpenseAssignView } from '../../models/expense-assign.model';
import { Sector } from '../../models/sector.model';
import { AssignType } from '../../models/assign-type.model';
import { Period } from '../../models/period.model';

@Component({
  selector: 'app-assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.scss']
})
export class AssignComponent implements OnInit, OnDestroy {
  // variables
  isUploading: Boolean = true;
  communityId: number;
  public data: ExpenseAssignView[] = [];
  expensesForm: FormGroup;
  expensesFormAux: FormGroup;
  expensesFormSingular: FormGroup;
  sectors: Sector[];
  expenseAmount: number;
  validForm: Boolean = false;
  assignSelected: number;
  componentDestroyed: Subject<boolean> = new Subject();
  objectSeleceted: any;
  assignAllExpense: Boolean = false;
  amountGlobal: number = 0;
  countExpenseGlobal: number = 0;
  countFees: number = 1;
  sumExpenseSelected = 0;
  public filterQuery = '';
  countSelectedExpense: number = 0;
  switch = true;
  sumAmountFees: number = 0;
  indexLastFees: number = 0;
  sumPorcent: number = 0;
  listPorcent: any = [];
  accountId: number = 0;
  translation: TranslateService;
  textSwitch: string;
  statePeriod: Boolean = false;
  assignmentType: string = 'GASTO_COMUN';
  assignmentTypeDefault: AssignType;
  periods: Period[];
  dateNow: string;
  firstPeriod: number;
  currentPeriod: number;


  constructor(private _fb: FormBuilder,
              private _expenseService: ExpenseService,
              private _sectorService: SectorService,
              private _translateService: TranslateService,
              private _toasterService: ToasterService,
              private _injector: Injector,
              private _periodService: PeriodService,
              private _settingService: SettingsService,
              private _assignmentTypeService: AssignmentsTypeService) {
    this.dateNow = moment(new Date().toISOString()).format();
  }

  ngOnInit() {
    // inicialización formulario visual
    this.expensesForm = this._fb.group({
      expense_unassign: this._fb.array([]),
      expense_assignments: this._fb.array([]),
    });
    // inicialización formulario auxiliar(inicializa formulario visual)
    this.expensesFormAux = this._fb.group({
      expense_unassign: this._fb.array([]),
      expense_assignments: this._fb.array([]),
    });
    // inicialización formulario singular(agrupa objetos cuando se selecciona mas de 1 gasto, este formulario se envía a API)
    this.expensesFormSingular = this._fb.group({
      expense_unassign: this._fb.array([]),
      expense_assignments: this._fb.array([]),
    });

    this.communityId = +localStorage.getItem('communityId');
    this.getData();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  // detectamos cambios en formualrio y evaluamos si validaciones necesarias
  detectChangeForm() {
    const counfForm = this.expensesFormSingular.controls['expense_assignments'].value.length;
    if (counfForm > 1) {
      const objetoFormBuilder = this.expensesForm.controls['expense_assignments'].value;
      this.sumAmountFees = 0;
      for (let _i = 0; _i < objetoFormBuilder.length; _i++) {
        const contentFees = objetoFormBuilder[_i].expense_fees;
        const amountExpense = this.expensesForm['controls'].expense_assignments['controls'][_i]['controls'].amount.value;
        this.accountId = objetoFormBuilder[_i].account_id;
        let porcentExpense = 0;
        for (let _j = 0; _j < contentFees.length; _j++) {
          const valueFee = this.expensesForm['controls'].expense_assignments['controls'][_i]['controls'].expense_fees['controls'];
          const amounFee = contentFees[_j].amount;
          porcentExpense = porcentExpense + contentFees[_j].porcent;
          if (_j < (contentFees.length - 1)) {
            this.listPorcent.push(contentFees[_j].porcent);
          }
          this.sumAmountFees = this.sumAmountFees + amounFee;
          this.indexLastFees = _j;
        }
        if (this.sumAmountFees < amountExpense) {
          this.sumPorcent = 0;
          const valueFee = this.expensesForm['controls'].expense_assignments['controls'][_i]['controls'].expense_fees['controls'];
          valueFee[this.indexLastFees]['controls'].porcent.setValue(contentFees[this.indexLastFees].porcent + (100 - porcentExpense));
          this.listPorcent.push(contentFees[this.indexLastFees].porcent + (100 - porcentExpense));
          valueFee[this.indexLastFees]['controls'].amount.setValue(contentFees[this.indexLastFees].amount + (amountExpense - this.sumAmountFees));
        } else {
          const valueFee = this.expensesForm['controls'].expense_assignments['controls'][_i]['controls'].expense_fees['controls'];
          valueFee[this.indexLastFees]['controls'].porcent.setValue(contentFees[this.indexLastFees].porcent - (porcentExpense - 100));
          this.listPorcent.push(contentFees[this.indexLastFees].porcent - (porcentExpense - 100));
          valueFee[this.indexLastFees]['controls'].amount.setValue(contentFees[this.indexLastFees].amount - (this.sumAmountFees - amountExpense));
        }
      }
      this.changeCountFees();
      this.detectChangeFormExpenses();
    } else {
      const objetoFormBuilder = this.expensesForm.controls['expense_assignments'].value;
      this.sumAmountFees = 0;
      for (let _i = 0; _i < objetoFormBuilder.length; _i++) {
        const contentFees = objetoFormBuilder[_i].expense_fees;
        this.accountId = objetoFormBuilder[_i].account_id;
        for (let _j = 0; _j < contentFees.length; _j++) {
          const valueFee = this.expensesForm['controls'].expense_assignments['controls'][_i]['controls'].expense_fees['controls'];
          const valueFeeValidate = this.expensesForm['controls'].expense_assignments['controls'][_i]['controls'].expense_fees['controls'][_j]['controls'].amount.value;
          const sectores = valueFee[_j]['controls'].expense_fee_sectors.value;
          let sumSectors = 0;
          sectores.forEach(sector => {
            sumSectors = sumSectors + sector.amount;
          });
          this.listPorcent.push(contentFees[_j].porcent);
        }
      }
      this.changeCountFees();
      this.detectChangeFormExpenses();
    }
    this._expenseService.startEvaluationOfExpenses(true);
  }

  changeCountFees(): void {
    const objetoFormBuilder = this.expensesFormSingular.controls['expense_assignments'].value;
    const countForm = this.expensesForm['controls'].expense_assignments['controls'][0]['controls'].feesCount.value;
    for (let _i = 0; _i < objetoFormBuilder.length; _i++) {
      this.expensesFormSingular['controls'].expense_assignments['controls'][_i]['controls'].account_id.setValue(this.accountId);
    }
    this.countFees = countForm;
    this._expenseService.updateObservable(true, this.countFees);
  }


  calculateAmountSectors(amountSectors: number, amountExpense: number) {
    if (amountSectors > amountExpense || amountSectors < amountExpense) {
      this.validForm = true;
    } else {
      this.validForm = false;
    }
  }

  calculateExpenseAmountSectors() {
    const expenses = this.expensesForm.controls['expense_assignments'].value;
    let amountSectors = 0;
    let amountFee = 0;
    const listExpenseSectors = [];
    for (const expense of expenses) {
      for (const fee of expense.expense_fees) {
        amountFee = 0;
        amountSectors = 0;
        amountFee = amountFee + fee.amount;
        for (const sector of fee.expense_fee_sectors) {
          amountSectors = amountSectors + sector.amount;
        }
        listExpenseSectors.push({amountSector: amountSectors, amountFee: amountFee});
      }
    }
    for (let _i = 0; _i < listExpenseSectors.length; ++_i) {
      if (listExpenseSectors[_i].amountSector !== listExpenseSectors[_i].amountFee) {
        this.validForm = true;
        break;
      } else {
        this.validForm = false;
      }
    }
  }

  // si hay cambios en formulario principal se vuelven a calcular valores para formulario a enviar a API
  detectChangeFormExpenses() {
    const objetoFormBuilder = this.expensesFormSingular.controls['expense_assignments'].value;
    this.sumAmountFees = 0;
    for (let _i = 0; _i < objetoFormBuilder.length; _i++) {
      const contentFees = objetoFormBuilder[_i].expense_fees;
      this.expensesFormSingular['controls'].expense_assignments['controls'][_i]['controls'].account_id.setValue(this.accountId);
      const amountExpense = this.expensesFormSingular['controls'].expense_assignments['controls'][_i]['controls'].amount.value;
      let porcentExpense = 0;
      for (let _j = 0; _j < contentFees.length; _j++) {
        const valueFee = this.expensesFormSingular['controls'].expense_assignments['controls'][_i]['controls'].expense_fees['controls'];
        const porcent = this.listPorcent[_j];
        valueFee[_j]['controls'].amount.setValue(Math.round((amountExpense * porcent) / 100));
        valueFee[_j]['controls'].porcent.setValue(((valueFee[_j]['controls'].amount.value / amountExpense) * 100));
        valueFee[_j]['controls'].expense_fee_sectors['controls'][0]['controls'].amount.setValue(Math.round((amountExpense * porcent) / 100));
        const amounFee = contentFees[_j].amount;
        porcentExpense = porcentExpense + contentFees[_j].porcent;
        this.sumAmountFees = this.sumAmountFees + amounFee;
        this.indexLastFees = _j;
      }
    }
    this.listPorcent = [];
  }

  initFees(porcent?: number, amount?: number) {
    return this._fb.group({
      amount: [amount, Validators.required],
      description: [''],
      number: 0,
      period: '',
      expense_fee_sectors: this._fb.array([]),
      porcent: porcent,
      code: [''],
      id: null,
      position: null,
    });
  }

  // inicializacion object dinamico
  initExpenses(object: any) {
    this.expenseAmount = 0;
    this.expenseAmount = object.amount;
    return this._fb.group({
      expense_id: [object.expense.id, Validators.required],
      expense_description: object.expense.description,
      expense_code: [object.expense.code, Validators.required],
      supplier_id: [object.expense.id, Validators.required],
      supplier_name: object.expense.supplier.name,
      expense_type_id: [object.expense.expense_type.id, Validators.required],
      expense_type: object.expense.expense_type.name,
      amount: [(+this.expenseAmount), Validators.required],
      account_id: [0, Validators.required],
      account_primary_id: [0, Validators.required],
      expense_fees: this._fb.array([this.initFees()]),
      feesCount: this.countFees,
      expense_assignment_type_id: this.assignmentTypeDefault.id

    });
  }

  changeAllAssign() {
    this.amountGlobal = 0;
    const data = this.data;
    if (this.assignAllExpense === true) {
      this.expensesFormSingular = this._fb.group({
        expense_unassign: this._fb.array([]),
        expense_assignments: this._fb.array([]),
      });
      const iter = data[Symbol.iterator]();
      data.forEach(() => {
        const element = iter.next();
        element.value.state = true;
        this.changeAssign(element.value);
      });
    } else {
      this.expensesFormSingular = this._fb.group({
        expense_unassign: this._fb.array([]),
        expense_assignments: this._fb.array([]),
      });
      const iter = data[Symbol.iterator]();
      data.forEach(() => {
        const element = iter.next();
        element.value.state = false;
        this.removeAssignExpense(element.value);
      });
      this.removeAllFees(this.expensesForm.value);
    }
  }

  changeAssign(object: any) {
    this.assignSelected = object.id
    this.expenseAmount = object.amount;
    this.objectSeleceted = object;
    const countExpense = this.expensesFormSingular.controls['expense_assignments'].value.length;
    if (object.state) {
      this.addAssignExpense(object);
      this.addAssignExpenseSingular(object);
    } else {
      // this.removeAllFees(this.expensesForm.value);
      this.amountGlobal = this.amountGlobal - (+object.amount);
      if (countExpense === 0) {
        this.removeAssignExpense(object);
        this.removeAllFees(this.expensesForm.value);
      } else {
        this.removeAssignExpense(object);
      }
      if (countExpense === 1) {
        this.removeAllFees(this.expensesForm.value);
      }
    }
    this.allSelected();
  }

  allSelected() {
    if (this.countExpenseGlobal === this.expensesFormSingular.controls['expense_assignments'].value.length) {
      this.assignAllExpense = true;
    } else {
      this.assignAllExpense = false;
    }
  }

  // agregamos objeto a expense-assign visual(suma de objetos seleccionados)
  addAssignExpense(object: any) {
    const promise = new Promise((resolve, reject) => {
      if (this.expensesForm.controls['expense_assignments'].value.length <= 1) {
        this.amountGlobal = this.amountGlobal + (+object.amount);
        // inicialización formulario visual
        this.expensesForm = this._fb.group({
          expense_unassign: this._fb.array([]),
          expense_assignments: this._fb.array([]),
        });
        const control = <FormArray>this.expensesForm.controls['expense_assignments'];
        const addrCtrl = this.initExpensesSingular(object);
        control.push(addrCtrl);
      } else {
        this.calculateFormExpense(object, 'add');
      }
    });
    return promise;
  }

  formatJson(object: any) {
    return JSON.stringify(object);
  }

  // agregamos objeto a formulario individual
  addAssignExpenseSingular(object: any) {
    const controlUnassign = <FormArray>this.expensesFormSingular.controls['expense_unassign'];
    const addrCtrlAssign = this.initUnAssign(object);
    controlUnassign.push(addrCtrlAssign);
    const control = <FormArray>this.expensesFormSingular.controls['expense_assignments'];
    const addrCtrl = this.initExpenses(object);
    control.push(addrCtrl);
  }

  // inicializacion object dinamico
  initUnAssign(object: any) {
    return this._fb.control(object.id);
  }

  // inicializacion object dinamico global
  initExpensesSingular(object: any) {
    return this._fb.group({
      expense_id: [object.expense.id, Validators.required],
      expense_description: object.expense.description,
      expense_code: [object.expense.code, Validators.required],
      supplier_id: [object.expense.id, Validators.required],
      supplier_name: object.expense.supplier.name,
      expense_type_id: [object.expense.expense_type.id, Validators.required],
      expense_type: object.expense.expense_type.name,
      amount: [(this.amountGlobal + (+object.amount)), Validators.required],
      account_id: [0, Validators.required],
      account_primary_id: [0, Validators.required],
      expense_fees: this._fb.array([]),
      feesCount: this.countFees,
      expense_assignment_type_id: this.assignmentTypeDefault.id
    });
  }

  // inicializacion object dinamico global
  initExpensesEmpty() {
    return this._fb.group({
      expense_id: 0,
      expense_description: '',
      expense_code: 0,
      supplier_id: 0,
      supplier_name: '',
      expense_type_id: 0,
      expense_type: 0,
      amount: this.amountGlobal,
      account_id: 0,
      account_primary_id: 0,
      expense_fees: this._fb.array([]),
      feesCount: this.countFees,
      expense_assignment_type_id: this.assignmentTypeDefault.id
    });
  }

  initAssignDeferred(deferred: number) {
    return {
      amount: deferred,
      account_id: 0,
      account_primary_id: 0,
      expense_fees: [],
      expense_id: this.objectSeleceted.expense.id,
      expense_description: this.objectSeleceted.expense.description,
      expense_code: this.objectSeleceted.expense.code,
      supplier_id: this.objectSeleceted.expense.id,
      supplier_name: this.objectSeleceted.expense.supplier.name,
      expense_type_id: this.objectSeleceted.expense.expense_type.id,
      expense_type: this.objectSeleceted.expense.expense_type.name,
      expense_assignment_type_id: this.assignmentTypeDefault.id
    };
  }

  calculateFormExpense(object: any, type: string) {
    if (type === 'add') {
      this.amountGlobal = this.amountGlobal + (+object.amount);
    } else {
    }
  }

  loopExpense(form: any, object: any) {
    const formCustom = form.value;
    if (formCustom.length > 0) {
      if (object !== undefined) {
        for (let _i = 0; _i < formCustom.length; _i++) {
          if (formCustom[_i].expense_id === object.id) {
            return _i;
          }
        }
        return -1;
      }
    }
  }

  loopExpenseUnAsssign(form: any, id: any) {
    if (form.length > 0) {
      for (let _i = 0; _i < form.length; _i++) {
        const idAsssign = form[_i];
        if (idAsssign === id) {
          // form.splice(_i, 1);
          return _i;
        }
      }
      return -1;
    }
  }

  removeAssignExpense(object: ExpenseAssign) {
    const ctrl = <FormArray>this.expensesFormSingular.controls['expense_assignments'];
    const index = this.loopExpense(ctrl, object.expense);
    ctrl.removeAt(index);
    const ctrlUnAssign = <FormArray>this.expensesFormSingular.controls['expense_unassign'];
    const arrayCustom = this.loopExpenseUnAsssign(ctrlUnAssign.value, object.id);
    ctrlUnAssign.removeAt(arrayCustom);

    this.countSelectedExpense = this.countSelectedExpense - 1;
    this.expensesForm = this._fb.group({
      expense_unassign: this._fb.array([]),
      expense_assignments: this._fb.array([]),
    });
    const control = <FormArray>this.expensesForm.controls['expense_assignments'];
    const addrCtrl = this.initExpensesEmpty();
    control.push(addrCtrl);
  }

  removeAssignExpenseSimple(i: number) {
    const ctrl = <FormArray>this.expensesForm.controls['expense_assignments'];
    ctrl.removeAt(i);
    const ctrlUnassign = <FormArray>this.expensesFormSingular.controls['expense_unassign'];
    ctrlUnassign.removeAt(i);
  }

  removeAssignExpenseSingular(i: number) {
    const ctrl = <FormArray>this.expensesFormSingular.controls['expense_assignments'];
    ctrl.removeAt(i);
  }

  // eliminamos elementos de lista dinamica de objetos
  removeAllFees(expensesForm: any) {
    const countFee = expensesForm.expense_assignments.length;
    if (countFee !== 0) {
      const promise = new Promise((resolve, reject) => {
        for (let _i = countFee; _i >= 0; _i--) {
          this.removeAssignExpenseSimple(_i);
        }
      });
      return promise;
    }
  }

  removeAllFeesSingular(expensesForm: any) {
    const countFee = expensesForm.expense_assignments.length;
    if (countFee !== 0) {
      const promise = new Promise((resolve, reject) => {
        for (let _i = countFee; _i >= 0; _i--) {
          this.removeAssignExpenseSingular(_i);
        }
      });
      this.amountGlobal = 0;
      return promise;
    }
  }

  changeFees() {
    const formDefault = this.expensesForm.value;
    const formSingular = this.expensesFormSingular.value;
    const form = this.expensesForm.controls['expense_assignments'];
    const form2 = this.expensesForm['controls'].expense_assignments['controls'][0]['controls'].amount.value;
    this.expensesForm['controls'].expense_assignments['controls'][0]['controls'].amount.setValue(100);
    let sumFees = 0;
    const list = [];
    for (const element of formDefault.expense_assignments) {
      for (const fee of element.expense_fees) {
        sumFees = sumFees + fee.amount;
        list.push({porcent: fee.porcent, amount: fee.amount});
      }
    }
    if (sumFees < this.amountGlobal) {
      let sumPorcent = 0;
      for (const element of formDefault.expense_assignments) {
        if (element.expense_fees.length === 1) {

        } else {
          for (let _i = 0; _i < element.expense_fees.length; _i++) {
            sumPorcent = sumPorcent + element.expense_fees[_i].porcent;
            if (_i === (element.expense_fees.length - 1)) {
              element.expense_fees[_i].porcent = (100 - sumPorcent);
            }
          }
        }
      }
    }
  }

  // enviamos data recolectada a api para su procesamiento
  sendExpenses() {
    const formDataAssignments = this.expensesFormSingular.value;
    const formDataGlobal = this.expensesForm.value;
    if (formDataAssignments.expense_assignments.length === 1) {
      formDataGlobal.expense_assignments.forEach((assignment, _indexAssignment) => {
        assignment.expense_fees.forEach((fee, _indexFee) => {
          fee.expense_fee_sectors.forEach((sector, _indexSector) => {
            this.expensesFormSingular['controls'].expense_assignments['controls'][_indexAssignment]['controls'].expense_fees['controls'][_indexFee]['controls'].expense_fee_sectors['controls'][_indexSector]['controls'].amount.setValue(sector.amount);
          });
        });
      });
    } else {
      // acá va el proceso para repartir montos de sectores para asignaciones multiples
    }
    const formDataUpdateSectors = this.expensesFormSingular.value;
    this.isUploading = true;
    if (this.expensesFormSingular.controls['expense_assignments'].value.length === 1) {
      this.expensesForm.value.expense_unassign[0] = this.assignSelected;
      let amountFees = 0;

      this.expensesForm.value.expense_assignments.forEach(assign => {
        assign.expense_fees.forEach((expense, _index) => {
          const dato = this.expensesFormSingular['controls'].expense_assignments['controls'][0]['controls'];
          this.expensesFormSingular['controls'].expense_assignments['controls'][0]['controls'].expense_fees['controls'][_index]['controls'].description.setValue(expense.description);
          this.expensesFormSingular['controls'].expense_assignments['controls'][0]['controls'].expense_fees['controls'][_index]['controls'].period.setValue(expense.period);
          amountFees = amountFees + expense.amount;
          this.expensesFormSingular['controls'].expense_assignments['controls'][0]['controls'].expense_fees['controls'][_index]['controls'].amount.setValue(amountFees);
          console.log(this.expensesFormSingular)
        });
        assign.amount = amountFees;
      });

      this.expensesFormSingular['controls'].expense_assignments['controls'][0]['controls'].amount.setValue(amountFees);
      const amountExpense = +this.expenseAmount;
      if (amountFees < amountExpense) {
        const amounDeferrent = (amountExpense - amountFees);
        const control = this.expensesFormSingular['controls'].expense_assignments.value;
        const addrCtrl = this.initAssignDeferred(amounDeferrent);
        control.push(addrCtrl);
      }
    }
    console.log(this.expensesFormSingular.value);
    this._expenseService.postExpenseAssign(this.expensesFormSingular.value, this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        expenses => {
          this.sumExpenseSelected = 0;
          this.isUploading = false;
          const sendData = expenses.json();
          this.getData();
          this.expensesForm = this._fb.group({
            expense_unassign: this._fb.array([]),
            expense_assignments: this._fb.array([]),
          });
          this.expensesFormSingular = this._fb.group({
            expense_unassign: this._fb.array([]),
            expense_assignments: this._fb.array([]),
          });
          this.amountGlobal = 0;
          this.assignAllExpense = false;
          this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this._toasterService.pop('success',
                translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
            });
        },
        error => {
          this.sumExpenseSelected = 0;
          this.isUploading = false;
          const data = error;
          const messageKey = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';

          this._translateService.get(['GENERAL.ERROR_TITLE', messageKey])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              switch (+error.status) {
                case 404:
                  this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                  break;
                case 500:
                  this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                  break;
                case 400:
                  this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                  break;
                default:
                  this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                  break;
              }
            });
        });
  }

  // ouput desde componente sectors
  ouputFormValid(estadoForm): void {
    const list = [];
    list.push(this.expensesForm.value);
    this.validForm = this._expenseService.detectStatus(list, this._expenseService.validateAmountsSectors(list), this.statePeriod);
  }

  // ouput desde componente fees
  ouputFormValidFee(estadoForm): void {
    const list = [];
    list.push(this.expensesForm.value);
    this.validForm = this._expenseService.detectStatus(list, this._expenseService.validateAmountsSectors(list), this.statePeriod);
  }

  // ouput periodo desde fees
  ouputPeriodSelected(state): void {
    this.statePeriod = state;
    const list = [];
    list.push(this.expensesForm.value);
    this.validForm = this._expenseService.detectStatus(list, this._expenseService.validateAmountsSectors(list), this.statePeriod);
  }

  getData() {
    const getExpenses = this._expenseService.allAssign(this.communityId);
    const getSectors = this._sectorService.getAll(this.communityId);
    const getAssignmentType = this._assignmentTypeService.getAssignmentType(this.assignmentType);
    const getSettings = this._settingService.getSettings(this.communityId);

    getSettings.concatMap(setting => {
      const settings = setting.json();
      const currentPeriodSetting = settings.find(x =>
        x.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD');
      const firstPeriodSetting = settings.find(x =>
        x.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD');
      this.firstPeriod = +firstPeriodSetting.value.replace('-', '');
      this.currentPeriod = +currentPeriodSetting.value;
      this.dateNow = moment(`${this.currentPeriod}01`).format();
      const getPeriods = this._periodService.getFuturePeriods(this.dateNow, 60);
      return Observable.forkJoin(
        getExpenses.map(expenses => expenses.json() as ExpenseAssign[]),
        getSectors.map(sectors => sectors.json() as Sector[]),
        getAssignmentType.map(response => response.json() as AssignType),
        getPeriods);
    })
      .takeUntil(this.componentDestroyed)
      .subscribe(res => {
        // expenses data
        this.data = [];
        this.isUploading = false;
        const expenseAssignments = res[0];
        expenseAssignments.forEach(expenseAssignment => {
          if (expenseAssignment && expenseAssignment.expense) {
            this.data.push(new ExpenseAssignView(expenseAssignment));
          }
        });
        this.countExpenseGlobal = this.data.length;
        // sectors data
        this.sectors = res[1];
        // recuperamos tipo de asignación por default como matriz!
        this.assignmentTypeDefault = res[2][0];
        // recuperamos periodos
        this.periods = res[3];
      }, error => {
        this.isUploading = false;
      });
  }
}
