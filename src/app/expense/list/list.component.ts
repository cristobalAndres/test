import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment/moment'
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/forkJoin'

// Services
import { PeriodService } from '../../services/period.service';
import { ExpenseService } from './../expense.service';
import { ExpensesTypesService } from '../../services/expense-types.service';
import { SettingsService } from '../../services/settings.service';
import { AssignmentsTypeService } from '../../services/assignment-type.service';

// ModelsF
import { Period } from '../../models/period.model';
import { ExpenseType } from '../../models/expense-type.model';
import { Expense, ExpenseListView } from '../../models/expense.model';
import { AssignType } from '../../models/assign-type.model';

// config
import { bsdatepickerConfig } from '../../app.config';

// DataPicker
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { es } from 'ngx-bootstrap/locale';
defineLocale('es', es);

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  communityId: number;
  componentDestroyed: Subject<boolean> = new Subject();
  date: string;
  expirationDate: string;
  periods: Period[];
  expenseTypes: ExpenseType[];
  assignTypes: AssignType[];
  data: ExpenseListView[] = [];
  isLoading: Boolean = true;
  selectPeriod: number;
  firstPeriod: number;
  selectDate: string;
  selectMonth: number;
  selectYear: number;
  months: any[];
  years: any[];
  selectExpirationDate: string;
  formSearchDate: FormGroup;
  searchDate: Boolean = true;
  selectedExpenseForDelete: Expense = null;
  selectedExpenseForUnassigment: Expense = null;
  filterQuery: string;
  deleteModalParam = {
    value: ''
  };
  dateNow: string;
  bsConfig: Partial<BsDatepickerConfig>;
  // inyección de servicios a utilizar
  constructor(private _periodService: PeriodService,
    private _expenseService: ExpenseService,
    private _expenseTypesService: ExpensesTypesService,
    private _settingService: SettingsService,
    private _formBuilder: FormBuilder,
    private _toasterService: ToasterService,
    private _translateService: TranslateService,
    private _assignmentTypeService: AssignmentsTypeService) {
    this.initFormSearchData();
    this.dateNow = moment(new Date().toISOString()).format();
  }

  ngOnInit() {
    // configura selector de período
    this.bsConfig = Object.assign({}, bsdatepickerConfig);
    // inicialización de variables
    this.communityId = +localStorage.getItem('communityId');
    this.date = moment(new Date).format();
    this.expirationDate = moment(new Date).format();
    this.initServices();
  }

  ngOnDestroy() {
    this.componentDestroyed.next(true);
    this.componentDestroyed.unsubscribe();
  }

  changeSelectedPeriod() {
    // console.log('dateSelected:', this.dateSelected);
  }

  // inicializamos data necesaria para funcionamiento de vista
  public initServices(): void {
    const getExpenseTypes = this._expenseTypesService.getAll();
    const getSettings = this._settingService.getSettings(this.communityId);
    const getAssignmentsType = this._assignmentTypeService.getAssignmentsTypes();
    // ejecución de observables necesarios para funcionamiento de vista
    getSettings.concatMap(setting => {
      const settings = setting.json();
      const currentPeriodSetting = settings.find(x =>
        x.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD');
      const firstPeriodSetting = settings.find(x =>
        x.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD');
      this.firstPeriod = +firstPeriodSetting.value.replace('-', '')
      this.selectPeriod = +currentPeriodSetting.value;
      const periodDiff = this.selectPeriod - this.firstPeriod;
      const getMonths = this._periodService.getFuturePeriods(this.dateNow, 12, periodDiff + 1);
      const getMonthNames = this._periodService.getMonths();
      const getYears = this._periodService.getYears(this.selectPeriod.toString(), this.firstPeriod.toString());
      const getPeriodObj = this._periodService.getPeriodObject(this.selectPeriod.toString());
      return Observable.forkJoin(getMonths,
        getExpenseTypes.map(response => response.json() as ExpenseType[]),
        this._expenseService.getAllExpensesFilter(this.communityId, this.selectPeriod).map(response => response.json() as Expense[]),
        getAssignmentsType.map(response => response.json() as AssignType[]),
        getMonthNames, getYears, getPeriodObj);
    })
      .takeUntil(this.componentDestroyed)
      .subscribe(
      data => {
        // recuperamos los periodos
        this.periods = data[0];
        // recuperamos los tipos de gastos
        this.expenseTypes = data[1];
        // recuperamos los gastos para la comunidad
        data[2].forEach(expenseAssignment => {
          this.data.push(new ExpenseListView(expenseAssignment));
        });
        // recuperamos los tipos de asignaciones
        this.assignTypes = data[3];

        this.months = data[4];
        this.years = data[5];

        const periodObj = data[6];
        this.selectMonth = periodObj.month;
        this.selectYear = periodObj.year;
        // this.updateSelectedRange();
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

  // inicialización formulario de busquedas
  public initFormSearchData(): void {
    this.formSearchDate = this._formBuilder.group({
      periodMonth: [''],
      periodYear: [''],
      period: [''],
      date: [''],
      expiration_date: [''],
      expanse_type: [''],
      assign_id: ['']
    });
  }

  // validamos filtros de búsqueda
  public changeOfPeriod() {
    // validar ingreso de periodos o fechas
    const padMonth = ('0' + this.selectMonth).slice(-2);
    const period = `${this.selectYear}${padMonth}`;
    this.selectPeriod = +period;
    // this.updateSelectedRange();
    // if (period) {
    //   this.searchDate = false;
    //   this.selectDate = null;
    //   this.selectExpirationDate = null;
    // } else {
    //   this.searchDate = true;
    // }
  }

  public selectExpense(expenseView: Expense, type?: string): void {
    this.selectedExpenseForDelete = null;
    this.selectedExpenseForUnassigment = null;
    if (!type) {
      this.selectedExpenseForDelete = expenseView;
      if (expenseView) {
        this.deleteModalParam.value = expenseView.supplier.name + ' ' + expenseView.code;
      }
    } else {
      this.selectedExpenseForUnassigment = expenseView;
      if (expenseView) {
        this.deleteModalParam.value = expenseView.supplier.name + ' ' + expenseView.code;
      }
    }
  }

  public deselectExpense(): void {
    this.selectedExpenseForDelete = null;
    this.selectedExpenseForUnassigment = null;
    this.deleteModalParam.value = '';
  }
  public getPercentage(assignment: any) {
    let amount = '';
    let type = '';

    assignment.consumer_service_dist_configs.forEach((cfg) => {
      if (cfg.consumer_service_distribution) {
        const consumerServiceDistribution = cfg.consumer_service_distribution;
        if (consumerServiceDistribution.consumer_service_dist_metadata) {
          const consumerServiceDistMetadata = consumerServiceDistribution.consumer_service_dist_metadata;
          consumerServiceDistMetadata.forEach((csdm) => {
            if (csdm.va.name === 'FIXED' || csdm.va.name === 'MONTHLY') {
              type = csdm.va.name;
            }
          })
        }
      }
    })

    if (type === 'FIXED') {
      assignment.consumer_service_dist_configs.forEach((cfg) => {
        amount = cfg.config.value[0].amount
      });
    }

    if (type === 'MONTHLY') {
      const period = assignment.expense_fees[0].period;
      assignment.consumer_service_dist_configs.forEach((cfg) => {
        const month = Number(moment(period + '01').format('MM'));
        cfg.config.value.forEach((r) => {
          if (r.month === month) {
            amount = r.amount;
          }
        });
      });
    }

    return amount;
  }

  public deleteExpense(): void {
    this._expenseService.deleteExpenseById(this.communityId, this.selectedExpenseForDelete.id)
      .takeUntil(this.componentDestroyed)
      .subscribe(
      deleted => {
        const DELETE_SUCCESS_MESSAGE = 'EXPENSE.GENERAL.NOTIFICATION.SUCCESS';
        this._translateService.get(['GENERAL.SUCCESS_TITLE', DELETE_SUCCESS_MESSAGE])
          .subscribe((res: string) => {
            this._toasterService.pop('success', res['GENERAL.SUCCESS_TITLE'], res[DELETE_SUCCESS_MESSAGE]);
          });
        this.data = this.data.filter((x: ExpenseListView) => x.id !== this.selectedExpenseForDelete.id)
      },
      error => {
        const messageError = error.json().message;
        const DELETE_ERROR_MESSAGE = 'EXPENSE.GENERAL.NOTIFICATION.' + messageError;
        this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
          .subscribe((res: string) => {
            this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
          });
        this.deselectExpense();
      },
      () => this.deselectExpense());
  }

  // ejecutamos búsqueda de gastos según cirterios ingresados
  public searchByDate(form: any): void {
    this.isLoading = true;
    form.period = this.selectPeriod;
    if (form.date || form.expiration_date) {
      form.period = null;
    }
    // buscar gastos por fecha seleccionada
    let f1 = null;
    let f2 = null;

    if (form.date && form.date !== null) {
      f1 = moment(form.date).format('YYYY-MM-DD');
    }
    if (form.expiration_date && form.expiration_date !== null) {
      f2 = moment(form.expiration_date).format('YYYY-MM-DD');
    }
    this._expenseService.getAllExpensesFilter(this.communityId, form.period, f1, f2, form.expanse_type, form.assign_id)
      .takeUntil(this.componentDestroyed)
      .subscribe(data => {
        // recuperamos los gastos para la comunidad
        const expenses = data.json() as Expense[];
        this.data = [];
        expenses.forEach(expenseAssignment => {
          this.data.push(new ExpenseListView(expenseAssignment));
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
        this.isLoading = false;
      });
  }

  public unassignmentExpense(expenseId: number): void {
    const jsonPostUnassignment = {
      expense: [expenseId]
    }

    this._expenseService.getExpenseById(this.communityId, this.selectedExpenseForUnassigment.id)
      .subscribe(
      result => {
        const expense = result.json();
        let isConsumerService = false;
        expense.expense_assignments.forEach((type) => {
          if (type.expense_assignment_type) {
            if (type.expense_assignment_type.slug === 'SERVICIO_DE_CONSUMO') {
              isConsumerService = true
            }
          }
        });

        let promise: any;
        if (isConsumerService) {
          promise = this._expenseService.unassignConsumerServices(this.communityId, this.selectedExpenseForUnassigment.id);
        } else {
          promise = this._expenseService.postExpenseUnassign(this.communityId, jsonPostUnassignment);
        }

        promise
          .takeUntil(this.componentDestroyed)
          .subscribe(
          unassignment => {
            const unassigned = this.data.find((x: ExpenseListView) => x.id === this.selectedExpenseForUnassigment.id);
            unassigned.expense_assignments = [];
            unassigned.removable = true;
            unassigned.unassignable = false;

            const DELETE_SUCCESS_MESSAGE = 'EXPENSE.GENERAL.NOTIFICATION.SUCCESS';
            this._translateService.get(['GENERAL.SUCCESS_TITLE', DELETE_SUCCESS_MESSAGE])
              .subscribe((res: string) => {
                this._toasterService.pop('success', res['GENERAL.SUCCESS_TITLE'], res[DELETE_SUCCESS_MESSAGE]);
              });
          },
          error => {
            const messageError = error.json().message;
            const DELETE_ERROR_MESSAGE = 'EXPENSE.GENERAL.NOTIFICATION.' + messageError;
            this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
              .subscribe((res: string) => {
                this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
              });
            this.deselectExpense();
          },
          () => this.deselectExpense());
      })
  }
}
