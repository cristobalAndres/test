import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { toasterConfig } from '../../app.config';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment/moment'

// Services
import { ExpenseService } from './../expense.service';
import { SectorService } from '../../services/sector.service';
import { SettingsService } from '../../services/settings.service';
import { AssignmentsTypeService } from '../../services/assignment-type.service';

// Model
import { Period } from '../../models/period.model';
import { Expense } from '../../models/expense.model';
import { Sector } from '../../models/sector.model';
import { AssignType } from '../../models/assign-type.model';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})

export class NewComponent implements OnInit, OnDestroy {
  // variables
  formExpense: FormGroup;
  formExpenseAux: FormGroup;
  componentDestroyed: Subject<boolean> = new Subject();
  isUploading: Boolean = false;
  expenses: Expense[];
  listFeeCustom: any[] = [];
  toasterConfig: ToasterConfig = toasterConfig;
  community: number;
  sectors: Sector[];
  validForm: Boolean = false;
  communityId: number;
  statePeriod: Boolean = false;
  assignmentType: string = 'GASTO_COMUN';
  assignmentTypeDefault: AssignType;
  periodInitSetting: string;
  periodCurrentSetting: string;

  constructor(private _fb: FormBuilder,
              private _expenseService: ExpenseService,
              private _translateService: TranslateService,
              private _toasterService: ToasterService,
              private _sectorService: SectorService,
              private _assignmentTypeService: AssignmentsTypeService,
              private _settingService: SettingsService) {
  }

  ngOnInit() {
    this.formExpense = this._fb.group({
      expense: this._fb.array([])
    });
    this.communityId = +localStorage.getItem('communityId');
    const getSectors = this._sectorService.getAll(this.communityId);
    const getAssignmentType = this._assignmentTypeService.getAssignmentType(this.assignmentType);
    const getSettings = this._settingService.getSettings(this.communityId);
    Observable.forkJoin(
      getSectors.map(sectors => sectors.json() as Sector[]),
      getAssignmentType.map(response => response.json() as AssignType),
      getSettings)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          // recuperamos los sectores
          this.sectors = data[0];
          // recuperamos tipo asignación
          this.assignmentTypeDefault = data[1][0];
          // recuperamos parametros de configuración apra comunidad
          this.periodInitSetting = ((data[2].json().find(p => p.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD')).value).replace('-', '');
          // recuperamos parametros de configuración para comunidad - periodo actual
          this.periodCurrentSetting = ((data[2].json().find(p => p.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD')).value);
        },
        error => {
          const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
            });
        });
    this.addExpense();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  // añadir objeto dinamico al formulario
  addExpense() {
    const control = <FormArray>this.formExpense.controls['expense'];
    const addrCtrl = this.initExpenses();
    control.push(addrCtrl);
  }

  // eliminamos gasto seleccionado
  removeExpense(i: number) {
    const ctrl = <FormArray>this.formExpense.controls['expense'];
    ctrl.removeAt(i);
  }

  // inicializacion object dinamico
  initExpenses() {
    return this._fb.group({
      code: [0, Validators.required],
      expense_type_id: [null, Validators.required],
      expense_type: [null],
      date: [null, Validators.required],
      expiration_date: [null],
      amount: [null, Validators.required],
      assign: null,
      description: [null, Validators.required],
      accountingAccount: null,
      subAccountingAccount: null,
      supplier_id: [null, Validators.required],
      supplier_name: null,
      feesCount: [],
      expense_assignments: this._fb.array([]),
      community_id: this.communityId,
      expenseState: null
    });
  }

  initSectors() {
    return this._fb.group({
      sector_id: [0, Validators.required]
    });
  }

  // detecta cambios en formulario y notifica para ejecutar validación de montos
  detectChangeForm() {
    this._expenseService.startEvaluationOfExpenses(true);
  }

  // enviamos data recolectada a api para su procesamiento
  sendExpenses(formGastos: any) {
    this.isUploading = true;
    for (const element of formGastos.expense) {
      if (element.date) {
        element.date = moment(element.date).format();
      }
      if (element.expiration_date !== '' && element.expiration_date !== null) {
        element.expiration_date = moment(element.expiration_date).format();
      } else {
        element.expiration_date = null;
      }
      if (element.community_id === null) {
        element.community_id = this.communityId;
      }
      let amountFees = 0;
      for (const assign of element.expense_assignments) {
        for (const expense of assign.expense_fees) {
          amountFees = amountFees + expense.amount;
        }
        assign.amount = amountFees;
      }

      if (amountFees < element.amount) {
        const amounDeferrent = (element.amount - amountFees);
        const control = element.expense_assignments;
        const addrCtrl = this.initAssignDeferred(amounDeferrent);
        control.push(addrCtrl);
      }
    }

    this._expenseService.postExpense(formGastos, this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        expenses => {
          this.isUploading = false;
          for (const element of formGastos.expense) {
            element.expense_assignments = [];
          }
          this.formExpense = this._fb.group({
            expense: this._fb.array([]),
          });
          this.addExpense();
          const sendData = expenses.json();
          this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this._toasterService.pop('success',
                translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
            });
        },
        error => {
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

  initAssignDeferred(deferred: number): object {
    return {
      amount: deferred,
      account_id: 0,
      account_primary_id: 0,
      expense_fees: [],
      expense_assignment_type_id: null
    };
  }

  // ouput desde componente sectors
  ouputFormValid(estadoForm): void {
    console.log('ouputFormValid()');
    this.validForm = this._expenseService.detectStatus(this.formExpense.value.expense, this._expenseService.validateAmountsSectors(this.formExpense.value.expense), this.statePeriod);
  }

  // ouput desde componente fees
  ouputFormValidFee(estadoForm): void {
    console.log('ouputFormValidFee()');
    this.validForm = this._expenseService.detectStatus(this.formExpense.value.expense, this._expenseService.validateAmountsSectors(this.formExpense.value.expense), this.statePeriod);
  }

  // ouput periodo desde fees
  ouputPeriodSelected(state): void {
    console.log('ouputPeriodSelected()');
    this.statePeriod = state;
    this.validForm = this._expenseService.detectStatus(this.formExpense.value.expense, this._expenseService.validateAmountsSectors(this.formExpense.value.expense), this.statePeriod);
  }
}
