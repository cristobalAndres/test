import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

// Services
import { SettingsService } from '../../services/settings.service';
import { SectorService } from '../../services/sector.service';
import { SuppliersService } from '../../services/suppliers.service';
import { PeriodService } from '../../services/period.service';
import { ConsumerServicesService } from '../../services/consumer-services.service';
import { HelperService } from '../../services/helpers.service';

// Models
import { Sector } from '../../models/sector.model';
import { Period } from '../../models/period.model';
import { Expense } from '../../models/expense.model';

import * as moment from 'moment/moment'

@Component({
  selector: 'app-assign-expenses-to-distribution',
  templateUrl: './assign-expenses-to-distribution.component.html',
  styleUrls: ['./assign-expenses-to-distribution.component.scss']
})
export class AssignExpensesToDistributionComponent implements OnInit {

  // variables
  public formDistribution: FormGroup;
  public communityId: number;
  public componentDestroyed: Subject<boolean> = new Subject();
  public sectors: Sector[];
  public sectorSelected: Sector;
  public periods: Period[];
  public periodSelected: Period;
  public isLoading: Boolean = false;
  public isLoadingExpense: Boolean = false;
  public distributions: any[] = [];
  public expenses: Expense[];
  public expenseSelected: any;
  public selectExpense: Expense;
  public expandCardsFlag: Boolean = false;
  public distributionSelected: any;
  public consumerServices: any[] = [];

  constructor(
    private _fb: FormBuilder,
    private _settingService: SettingsService,
    private _toasterService: ToasterService,
    private _sectorService: SectorService,
    private _supplierService: SuppliersService,
    private _translateService: TranslateService,
    private _periodService: PeriodService,
    private _consumerServicesService: ConsumerServicesService,
    private _helperService: HelperService
  ) { }

  ngOnInit() {
    this.initFormDistribution();
    this.communityId = +localStorage.getItem('communityId');
    this.getInitView();
  }

  // iniciamos servicios para vista notas de crédito
  public getInitView(): void {
    const getSettings = this._settingService.getSettings(this.communityId);
    getSettings.concatMap(setting => {
      const settings = setting.json();
      const currentPeriodSetting = settings.find(x =>
        x.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD');
      const currentPeriod = +currentPeriodSetting.value;
      const firstPeriodSetting = settings.find(x =>
        x.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD');
      const firstPeriod = +firstPeriodSetting.value.replace('-', '');
      const dateNow = moment(`${currentPeriod}01`).format();

      const getSectors = this._sectorService.getAll(this.communityId);
      const getPeriods = this._periodService.getFuturePeriods(moment(currentPeriod, 'YYYYMM').format(), 12);
      return Observable.forkJoin(
        getSectors.map(sector => sector.json() as Sector[]),
        getPeriods);
    })
      .takeUntil(this.componentDestroyed)
      .subscribe(res => {
        // rescatamos sectores
        this.sectors = res[0];

        // rescatamos periodos
        this.periods = res[1];
        if (this.periods) {
          this.periodSelected = this.periods[0];
        }
      }, error => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
      });
  }

  public expenseSelectedAssign(expense: any): void {
    if (expense) {
      this.consumerServices = [];
      this.expenseSelected = expense;
      const datos = this.consumerServices;

      this.formDistribution.controls['expense_id'].setValue(this.expenseSelected.expense.id);
      this.formDistribution.controls['expense_assignment_id'].setValue(this.expenseSelected.id);
      this.formDistribution.controls['expense_code'].setValue(this.expenseSelected.expense.code);
      this.formDistribution.controls['expense_type'].setValue(this.expenseSelected.expense.expense_type.code);
      this.formDistribution.controls['amount'].setValue(this.expenseSelected.amount);
      this.formDistribution.controls['consumer_service_distribution_id'].setValue(this.distributionSelected.id);
      this.formDistribution.controls['period'].setValue(this.periodSelected.period);
      this.formDistribution.controls['sector_id'].setValue(this.sectorSelected.id);
      this.formDistribution.controls['distribution'].setValue({ distribution_type: this.distributionSelected.consumer_service_dist_metadata.find(m => m.value.key === 'DISTRIBUTION_TYPE').value.name, fixed_charged_type: this.distributionSelected.consumer_service_dist_metadata.find(m => m.value.key === 'FIXED_CHARGED_TYPE').value.name });
    }
  }

  // entrega el monto recalculado para asignación según distribución además mapea data en formulario asignación
  public calculateAmountPercent(amount: number, configuration: any, percent: number): number {
    let config = null;
    let inList = 0;
    if (this.consumerServices.length > 0) {
      inList = this.consumerServices.filter(c => c.id === configuration.id).length;
    }
    if (inList === 0) {
      if (configuration.consumer_service) {
        config = {
          id: configuration.id,
          name: configuration.consumer_service.name,
          percent: percent,
          amount: amount,
          consumer_service_dist_config_id: configuration.id,
          account_id: configuration.consumer_service.account_id,
          type: 'CONSUMER_SERVICE'
        };
      } else {
        config = {
          percent: percent,
          amount: amount,
          consumer_service_dist_config_id: configuration.id,
          type: 'FIXED_CHARGE'
        };
      }
      this.consumerServices.push(config)
    }
    return amount;
  }

  // iniciamos formBuilder vista
  public initFormDistribution(): void {
    this.formDistribution = this._fb.group({
      expense_id: [null, Validators.required],
      expense_assignment_id: [null, Validators.required],
      consumer_service_distribution_id: [null, Validators.required],
      expense_code: null,
      expense_type: null,
      period: null,
      amount: null,
      sector_id: null,
      distribution: { distribution_type: null, fixed_charged_type: null },
      consumer_service: [],
      fixed_charged: null
    });
  }

  // mostrar detalle de distrubicón seleccionada
  public activeCardDistribution(distributionsConfig: any): void {
    this.expenseSelected = null;
    this.distributionSelected = distributionsConfig;
    if (distributionsConfig.consumer_service_dist_metadata) {
      const isMonthly = distributionsConfig.consumer_service_dist_metadata.filter(d => d.value.key === 'DISTRIBUTION_TYPE').filter(t => t.value.name === 'MONTHLY');
      if (isMonthly.length > 0) {
        distributionsConfig.isMonth = true;
      } else {
        distributionsConfig.isMonth = false;
      }
    }

    this.distributions.forEach(d => {
      if (d.id !== distributionsConfig.id) {
        d.state = false;
      } else {
        distributionsConfig.state = true;
      }
    });

    this.getExpenses(); // traemos gastos para proveedor de distribución seleccionada
  }

  // rescatamos las distribuciones para el sector seleccionado
  public getDistributions(): void {
    this.distributions = [];
    this.distributionSelected = null;
    this.isLoading = true;
    this._consumerServicesService.distributionsSector(this.communityId, this.sectorSelected.id)
      .subscribe(res => {
        this.distributions = res.json();
        this.distributions.map(d => { d.state = false, d.isMonth = false });
        this.distributions.forEach(distribution => {
          distribution.table = this.tableDistribution(distribution);
        });
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
      });
  }

  // trae gastos para proveedor de distribución seleccionada
  public getExpenses(): void {
    this.expenses = [];
    this.isLoadingExpense = true;
    this._consumerServicesService.expensesDistribution(this.communityId, this.distributionSelected.supplier.id)
      .subscribe(res => {
        this.expenses = res.json().filter(e => e !== null);
        this.isLoadingExpense = false;
      }, err => {
        this.isLoadingExpense = false;
        console.log(err);
      });
  }

  // expande y contrae contenedores card
  public expandCards(): void {
    this.expandCardsFlag = !this.expandCardsFlag;
  }

  // indentifica el mes seleccionado para asignación
  public identifyMonth(identifyMonth): any {
    let listPercent = null;
    identifyMonth.forEach(month => {
      if (month.month === this.periodSelected.name) {
        listPercent = month.amounts;
      }
    });
    return listPercent;
  }

  // encargada de crear matriz para tabla según servicio de consumo y sus valores
  public tableDistribution(distribution: any) {
    const object = {
      headers: [],
      body: [],
      object: []
    };

    distribution.consumer_service_dist_configs.forEach(consumer => {
      object.headers.push(consumer.consumer_service ? consumer.consumer_service.name : consumer.config.type);
      object.object.push(consumer.consumer_service ? consumer : consumer);
    });

    const distributionType = distribution.consumer_service_dist_metadata.find(m => m.value.key === 'DISTRIBUTION_TYPE');
    if (distributionType.value.name === 'FIXED') {
      const objectMonthFixed = { month: '', amounts: [], fixedChargeAmount: 0 };
      distribution.consumer_service_dist_configs.forEach(consumer => {
        const countConfig = consumer.config.value.length;
        if (countConfig === 1) {
          objectMonthFixed.fixedChargeAmount = consumer.config.value[0].fixedChargeAmount;
          objectMonthFixed.amounts.push(consumer.config.value[0]);
        }
      });
      object.body.push(objectMonthFixed);
    } else {
      this.periods.forEach(period => {
        const objectMonth = { month: '', amounts: [], fixedChargeAmount: 0 };
        objectMonth.month = period.name;
        distribution.consumer_service_dist_configs.forEach(consumer => {
          if (consumer.config.value) {
            const objectCurrent = consumer.config.value.find(m => m.monthName === period.name);
            if (objectCurrent) {
              objectMonth.fixedChargeAmount = objectCurrent.fixedChargeAmount;
              objectMonth.amounts.push(objectCurrent);
            }
          }
        });
        object.body.push(objectMonth);
      });
    }

    return object;
  }

  // enviamos formulario de asignación a API
  public onSubmit(): void {
    this.isLoadingExpense = true;
    this.formDistribution.controls['consumer_service'].setValue(this.consumerServices.filter(s => s.type === 'CONSUMER_SERVICE'));
    this.formDistribution.controls['fixed_charged'].setValue(this.consumerServices.find(s => s.type === 'FIXED_CHARGE'));
    console.log(JSON.stringify(this.formDistribution.value));
    this._consumerServicesService.postAssignDistribution(this.communityId, this.formDistribution.value)
      .subscribe(
      response => {
        // gestionar respuesta
        this.isLoadingExpense = false;
        this.expenseSelected = null;
        this.getExpenses();
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            this._toasterService.pop('success',
              translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
          });
      }, err => {
        this.isLoadingExpense = false;
        const messageKey = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
        this._translateService.get(['GENERAL.ERROR_TITLE', messageKey])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            switch (+err.status) {
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
      }
      );
  }

}
