import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

// Services
import { SettingsService } from '../../services/settings.service';
import { SectorService } from '../../services/sector.service';
import { ConsumerServicesService } from '../../services/consumer-services.service';
import { PeriodService } from '../../services/period.service'
// Models
import { Sector } from '../../models/sector.model';
import { ConsumerService } from '../../models/consumer-service.model';
import { Period } from '../../models/period.model';
import { CommunityPeriod } from '../../models/community-period.model';
import { ExpenseAssignService } from '../../models/expense-assign.model';
import { ConsumerServiceReading, ConsumerServiceReadingView } from '../../models/consumer-service-reading.model';

@Component({
  selector: 'app-read-register',
  templateUrl: './record-reading.component.html',
  styleUrls: ['./record-reading.component.scss']
})

export class RecordReadingComponent implements OnInit {

  @ViewChild(ModalDirective) public confirmationClear: ModalDirective;
  public formReading: FormGroup;
  public componentDestroyed: Subject<boolean> = new Subject();
  public sectors: Sector[];
  public communityId: number;
  public consumerServices: ConsumerService[] = [];
  public consumerServicesReading: ConsumerServiceReadingView[] = [];
  public periods: Period[];
  public isLoading: Boolean = true;
  public isManual: Boolean = false;
  public formIsValid: Boolean = true;
  public lockedPeriods: CommunityPeriod[] = [];
  public isLockedPeriod: Boolean = false;
  public pediodSelected: Period = new Period;
  public deleteLocked: Boolean = true;
  public expenseAssignService: ExpenseAssignService[] = [];
  public totalExpense: number = 0;
  public totalAssigned: number = 0;
  public consumertotalConsumption: number = 0;
  public consumertotalAmount: number = 0;
  isReadyToShow: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _toasterService: ToasterService,
    private _translateService: TranslateService,
    private _settingService: SettingsService,
    private _periodService: PeriodService,
    private _sectorService: SectorService,
    private _consumerServicesService: ConsumerServicesService,

  ) { }

  ngOnInit() {
    this.initFormReading();
    this.communityId = +localStorage.getItem('communityId');
    this.getInitView();
  }

  public initFormReading(): void {
    this.formReading = this._fb.group({
      sector: [null, Validators.required],
      period: [null, Validators.required],
      service: [null, Validators.required]
    });
  }

  public getInitView(): void {
    this.isLoading = true;
    const getSettings = this._settingService.getSettings(this.communityId);
    getSettings.concatMap(setting => {
      const settings = setting.json();
      const currentPeriodSetting = settings.find(x => x.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD');
      const currentPeriod = +currentPeriodSetting.value;

      const firstPeriodSetting = settings.find(x => x.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD');
      const firstPeriod = +firstPeriodSetting.value.replace('-', '');

      const getSectors = this._sectorService.getAll(this.communityId);
      const getPeriods = this._periodService.getFirstToCurrent(firstPeriod.toString(), currentPeriod.toString());
      const getLockedPeriod = this._consumerServicesService.getPeriodLocked(this.communityId);
      return Observable.forkJoin(
        getSectors.map(sector => sector.json() as Sector[]),
        getPeriods,
        getLockedPeriod,
      );
    })
      .finally(() => this.isLoading = false)
      .takeUntil(this.componentDestroyed)
      .subscribe(res => {
        this.sectors = res[0];
        this.periods = res[1];
        this.lockedPeriods = res[2].json() as CommunityPeriod[];
        this.formReading.controls['period'].setValue(this.periods[0]);
        this.formReading.controls['sector'].setValue(this.sectors[0]);
        this.getServices();
      }, error => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
          this.isReadyToShow = true;
      });
  }

  public validExpenceAssign(): void {
    this.totalAssigned = 0;
    this.totalExpense = 0;
    const sector = this.formReading.value.sector as Sector;
    const service = this.formReading.value.service as ConsumerService;
    this.pediodSelected = this.formReading.value.period as Period;
    this._consumerServicesService.getExpendAssignServiceManual(this.communityId, sector.id, service.id, this.pediodSelected.period)
      .subscribe(
      result => {
        this.expenseAssignService = result.json() as ExpenseAssignService[];
        this.expenseAssignService.forEach((r) => {
          this.totalExpense += +r.amount;
        })
      },
      error => {
        console.log(error);
      })
  }

  public validIfManual(service: ConsumerService): void {
    this.isManual = false;
    service.consumer_service_metadata.forEach((m) => {
      if (m.consumer_service_field.name === 'MANUAL') {
        this.isManual = true;
        this.validExpenceAssign();
      }
    })
  }

  public onChangePeriod() {
    this.pediodSelected = this.formReading.value.period as Period;
    this.isLockedPeriod = false;
    this.lockedPeriods.forEach((p) => {
      if (p.period === this.pediodSelected.period.toString()) {
        this.isLockedPeriod = true;
      }
    })
    this.getConsumerServicesReading();
  };

  public getConsumerServicesReading(): void {
    this.consumerServicesReading = [];
    this.expenseAssignService = [];
    if (this.formReading.valid) {
      const period = this.formReading.value.period as Period;
      const service = this.formReading.value.service as ConsumerService;
      const sector = this.formReading.value.sector as Sector;
      this.validIfManual(service);
      this.deleteLocked = true;
      this.isLoading = true;
      this._consumerServicesService.getConsumerServicesReading(this.communityId, service.id, period.period, sector.id)
        .finally(() => this.isLoading = false)
        .takeUntil(this.componentDestroyed)
        .subscribe(res => {
          const items: ConsumerServiceReading[] = res.json() as ConsumerServiceReading[];
          items.forEach((item) => {
            if (item.current_readings.length > 0) {
              this.deleteLocked = false;
            }
            if (item.current_readings.length === 0) {
              if (item.prev_readings.length > 0) {
                this.totalAssigned += +item.prev_readings[0].amount;
              }
            } else {
              this.totalAssigned += +item.current_readings[0].amount;
            }
            this.consumerServicesReading.push(new ConsumerServiceReadingView(item))
          });
          this.updateTotalConsumption();
        })
    }
  }

  public getServices(): void {
    this.isLockedPeriod = false;
    this.formReading.controls['service'].setValue(null);
    this.consumerServicesReading = [];
    this.consumerServices = [];
    const sector = this.formReading.value.sector as Sector;
    if (sector) {
      this._consumerServicesService.getConsumerServices(sector.id)
        .subscribe(
        res => {
          if (res) {
            if (res.json()[0]) {
              this.consumerServices = res.json() as ConsumerService[];
              this.formReading.controls['service'].setValue(this.consumerServices[0]);
              this.getConsumerServicesReading();
              this.isReadyToShow = true;
            }
          }
        },
        err => console.log(err));
    }
  }

  public showErrorValidation(item: ConsumerServiceReadingView) {
    this._translateService.get(['GENERAL.ERROR_TITLE', 'CONSUMER_SERVICES.RECORD_READING.ERROR.VALUE'])
      .subscribe((translation: string) => {
        this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'] + ' en unidad [' + item.name + ']', translation['CONSUMER_SERVICES.RECORD_READING.ERROR.VALUE']);
      });
  }

  public updateTotalConsumption() {
    this.consumertotalConsumption = 0;
    this.consumertotalAmount = 0;
    this.consumerServicesReading.forEach((item) => {
      this.consumertotalConsumption += item.consumption;
      this.consumertotalAmount += item.amount;
    });
  };

  public validRow(rowId: number) {
    this.formIsValid = true;
    this.totalAssigned = 0;
    this.consumerServicesReading.map((item) => {
      item.consumption = item.current_reading - item.prev_reading;
      this.totalAssigned += +item.amount;

      if (this.totalAssigned > this.totalExpense) {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'CONSUMER_SERVICES.RECORD_READING.ERROR.ASSIGNED_AMOUNT'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'] + ' en unidad [' + item.name + ']', translation['CONSUMER_SERVICES.RECORD_READING.ERROR.ASSIGNED_AMOUNT']);
          });
        this.formIsValid = false;
        this.totalAssigned -= item.amount;
        item.amount = 0;
      }

      item.amount = item.amount ? item.amount : 0;
      item.current_reading = item.current_reading ? item.current_reading : 0;
      item.prev_reading = item.prev_reading ? item.prev_reading : 0;

      if (item.consumption < 0) {
        this.showErrorValidation(item)
        this.formIsValid = false;
      }
      if (rowId === item.id) {
        if (item.consumption < 0) {
          item.is_current_reading = 2;
        } else {
          item.is_current_reading = 1;
        }
      }
      return item;
    })
    this.updateTotalConsumption();
  }

  public onSave(): void {
    const data: any = [];
    this.consumerServicesReading.forEach((c) => {
      const row: any = {};
      row.unit_id = c.id;
      row.prev = c.prev_reading;
      row.current = c.current_reading;
      row.reading_id = c.reading_id;
      row.diffExpenseAsigned = this.totalExpense - this.totalAssigned;
      if (this.isManual) {
        row.amount = c.amount;
      }
      data.push(row);
    });
    const service = this.formReading.value.service as ConsumerService;
    const period = this.formReading.value.period as Period;
    this._consumerServicesService.sendReading(this.communityId, service.id, period.period, data)
      .subscribe(
      result => {
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.SUCCESS_MESSAGE'])
          .subscribe((translation: string) => {
            this._toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.SUCCESS_MESSAGE']);
          });
        this.getConsumerServicesReading();
      },
      error => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
      }
      )
  }

  public clearForm() {
    const service = this.formReading.value.service as ConsumerService;
    const period = this.formReading.value.period as Period;

    this._consumerServicesService.removeReading(this.communityId, service.id, period.period)
      .subscribe(
      result => {
        this.consumerServicesReading.map((r) => {
          r.amount = 0;
          r.current_reading = 0;
          r.prev_reading = 0;
          r.consumption = 0;
          return r
        })
        this.getConsumerServicesReading();
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.DELETE'])
          .subscribe((translation: string) => {
            this._toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.DELETE']);
          });
      },
      error => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
      }
      )

  }

}

