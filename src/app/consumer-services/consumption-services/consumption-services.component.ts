import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

// services
import { SectorService } from '../../services/sector.service';
import { AccoutingAccountService } from '../../services/accouting-account.service';
import { PeriodService } from '../../services/period.service';
import { ConsumerServicesService } from '../../services/consumer-services.service';
import { CommunityService } from '../../services/community.service';

// models
import { Sector } from '../../models/sector.model';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-consumption-services',
  templateUrl: './consumption-services.component.html',
  styleUrls: ['./consumption-services.component.scss']
})

export class ConsumptionServicesComponent implements OnInit, OnDestroy {
  public serviceForm: FormGroup;
  public ServiceId: number = 0;
  public isUploading: Boolean = true;
  public sectors: any;
  public accounts: Account[];
  public communityId: number;
  private componentDestroyed: Subject<boolean> = new Subject();
  public months: any[];
  public fields: any;
  public units_property: any = [];
  public measures: any = [];
  public charges_system: any = [];
  public charges_system_toshow: any = [];
  public units: any[];
  showCalendar: boolean = false;
  showUnits: boolean = false;
  showAmountFixed: boolean = false;
  formValidate: boolean = false;
  readyToShow: boolean = false;
  defaultRadioValue: any = null;

  constructor(private _translateService: TranslateService,
              private _accountingAccountService: AccoutingAccountService,
              private _sectorService: SectorService,
              private _periodService: PeriodService,
              private _consumptionService: ConsumerServicesService,
              private _comunityService: CommunityService,
              private fb: FormBuilder,
              private _toasterService: ToasterService) {
    this.serviceForm = fb.group({
      name: [null, Validators.required],
      account_primary_id: [null, Validators.required],
      sector_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      unit_property_id: null,
      charge_system_id: [null, Validators.required],
      amountByMonth: this.fb.array([]),
      typeUnits: this.fb.array([]),
      amount_fixed: null
    });
  }

  initAmountByMonths(name: string, amount: number = null) {
    return this.fb.group({
      name: name,
      amount: amount
    });
  }

  initUnitCommunity(id: number, name: string, active: boolean = false, selected: boolean = false) {
    return this.fb.group({
      id: id,
      name: name,
      active: active,
      selected: selected,
    })
  }

  initAmountByMonthCtrls(): void {
    const control = <FormArray> this.serviceForm.controls['amountByMonth'];
    this.months.forEach(month => {
      control.push(this.initAmountByMonths(month.name));
    });
  }

  initTypeUnitsCtrls(): void {
    this.defaultRadioValue = null;
    const control = <FormArray> this.serviceForm.controls['typeUnits'];
    this.units.forEach((unit) => {
      unit.selected = false;
      control.push(this.initUnitCommunity(unit.id, unit.name));
    });
  }

  clearForm(): void {
    this.showCalendar = false;
    this.showUnits = false;
    this.showAmountFixed = false;
    this.formValidate = false;
    this.removeAllAmountByMonths(this.serviceForm.value);
    this.removeAllTypeUnits(this.serviceForm.value);
    this.serviceForm.reset();
    this.charges_system = [];
    this.measures = [];
    this.getInitValues();
  };

  getInitValues(): void {
    this.communityId = +localStorage.getItem('communityId');
    const getSectors = this._sectorService.getAll(this.communityId);
    const getAccount = this._accountingAccountService.getAccountsCustomerServices(this.communityId);
    const getFields = this._consumptionService.getFields();
    const getUnits = this._comunityService.getUnits(this.communityId);

    const getMonths = this._periodService.getMonths().subscribe((months) => {
      this.months = months;
    });

    Observable.forkJoin(
      getSectors.map(sectors => sectors.json() as Sector[]),
      getAccount.map(account => account.json()),
      getFields.map(fields => fields.json()),
      getUnits.map(units => units.json())
    ).takeUntil(this.componentDestroyed)
      .subscribe((response) => {
        this.sectors = response[0];
        this.accounts = response[1];
        this.fields = response[2];
        this.units = response[3];

        this.fields.forEach(element => {
          if (element.key === 'MEASURE') {
            this.measures.push(element);
          }
          if (element.key === 'UNIT_PROPERTY') {
            this.units_property.push(element);
            this.units_property = this.units_property.filter(f => f.name === 'UNIT');
          }
          if (element.key === 'CHARGE_SYSTEM') {
            this.charges_system.push(element);
          }
          if (element.key === 'UNIT_TYPES') {

          }
          if (element.key === ' MEASURE_UNIT_VALUE') {

          }
        });
        this.isUploading = false;
        this.readyToShow = true;

        this.serviceForm.controls['account_primary_id'].setValue('');
        this.serviceForm.controls['sector_id'].setValue('');
        this.serviceForm.controls['unit_id'].setValue('');
        this.serviceForm.controls['unit_property_id'].setValue(this.units_property[0]);
        this.changeUnitProperty();

      }, error => {
        // en caso que servicio devuelva error, mostrar alerta
        const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
        this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
          .subscribe((res: string) => {
            this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
          });
        this.isUploading = false;
      });
    this.isUploading = false;
    this.readyToShow = true;
  }

  ngOnInit() {
    this.getInitValues();
  };

  public onSubmit(formData: any): void {
    if (this.ServiceId !== 0) {
      // edita servicio
    } else {
      // crea servicio
      this.setInfoToSend(formData);
    }
  }

  public changeUnit(unit: any): void {
    const arrayUnits = this.serviceForm.controls['typeUnits'].value;
    arrayUnits.forEach(element => {
      if (this.serviceForm.controls['unit_property_id'].value.name === 'UNIT') {
        if (element.id === unit.id) {
          element.selected = unit.selected;
        }
      } else {
        if (element.id !== unit.id) {
          unit.selected = false;
        } else {
          unit.selected = true;
        }
        element.selected = unit.selected;
      }
    });
    this.validateForm();
  };

  changeAmount(): void {
    this.validateForm();
  };

  changeAmountFixed(value): void {
    this.validateForm();
  };

  updatedAmountByMonth(value): void {
    this.validateForm();
  };

  changeMeasure(): void {
    this.validateForm();
  };

  changeUnitProperty(): void {
    console.log('Unit Property', this.serviceForm.value);
    this.showUnits = true;
    this.serviceForm.controls['charge_system_id'].setValue('');
    this.removeAllTypeUnits(this.serviceForm.value);
    this.initTypeUnitsCtrls();
    this.checkAmountFixed();
    this.validateForm();
  };

  checkAmountFixed(): void {
    this.showAmountFixed =
      (this.serviceForm.controls['charge_system_id'].value &&
        ((this.serviceForm.controls['charge_system_id'].value.name !== 'MONTHLY_VARIABLE') &&
          (this.serviceForm.controls['charge_system_id'].value.name !== 'MANUAL') &&
          (this.serviceForm.controls['charge_system_id'].value.name !== 'DISTRIBUTION'))) ? true : false;
  };

  checkShowCalendar(): void {
    if (this.serviceForm.controls['charge_system_id'].value && this.serviceForm.controls['charge_system_id'].value.name === 'MONTHLY_VARIABLE') {
      this.initAmountByMonthCtrls();
      this.showCalendar = true;
    } else {
      this.showCalendar = false;
    }
  };

  changeChargeSystem(): void {
    this.removeAllAmountByMonths(this.serviceForm.value);
    this.serviceForm.controls['amount_fixed'].setValue('');
    this.checkShowCalendar();
    this.checkAmountFixed();
    this.validateForm();
  };

  validateForm(): boolean {
    this.formValidate = false;
    if (this.showUnits) {
      let counter: number = 0;
      const arrayUnits = this.serviceForm.controls['typeUnits'].value;
      arrayUnits.forEach(element => {
        if (element.selected) {
          counter++;
        }
      });
      if (counter === 0) {
        return false;
      }
    }

    if (this.showAmountFixed) {
      if (this.serviceForm.controls['amount_fixed'].value <= 0) {
        return false;
      }
    }

    if (this.showCalendar) {
      let counter: number = 0;
      const amountByMonth = this.serviceForm.controls['amountByMonth'].value;
      amountByMonth.forEach(element => {
        if (element.amount === null || element.amount <= 0) {
          counter++;
        }
      });

      if (counter > 0) {
        return false;
      }
    }
    this.formValidate = true;
    return this.formValidate;
  }

  removeAllAmountByMonths(form: any) {
    if (form.amountByMonth) {
      const promise = new Promise((defered, reject) => {
        for (let position = form.amountByMonth.length - 1; position >= 0; position--) {
          this.removeControl(position, 'amountByMonth')
        }
      })
      return promise;
    }
  };

  removeAllTypeUnits(form: any) {
    if (form.typeUnits) {
      const promise = new Promise((defered, reject) => {
        for (let position = form.typeUnits.length - 1; position >= 0; position--) {
          this.removeControl(position, 'typeUnits')
        }
      })
      return promise;
    }
  }

  removeControl(index: number, name: string) {
    const ctrl = <FormArray>this.serviceForm.controls[name];
    ctrl.removeAt(index);
  }

  public setInfoToSend(formData): void {
    const data: any = {};
    const types: any = [];
    const mondata: any = [];
    this.isUploading = true;

    data.name = formData.name;
    data.account_id = formData.account_primary_id.id;
    data.sector_id = formData.sector_id.id;
    data.metadata = [];

    data.metadata.push({'consumer_service_field_id': formData.unit_id.id});
    data.metadata.push({'consumer_service_field_id': formData.unit_property_id.id});
    data.metadata.push({'consumer_service_field_id': formData.charge_system_id.id});

    if (formData.typeUnits) {
      formData.typeUnits.forEach(element => {
        if (element.selected) {
          types.push(element.id);
        }
      });

      if (types.length > 0) {
        data.metadata.push({'consumer_service_field_id': 9, 'value': {'type': types}});
      }
    }

    if (formData.amountByMonth) {
      formData.amountByMonth.forEach(element => {
        mondata.push({month: element.name, amount: element.amount});
      });

      if (mondata.length > 0) {
        data.metadata.push({'consumer_service_field_id': 10, 'value': mondata});
      }
    }

    if (this.showAmountFixed) {
      data.metadata.push({
        'consumer_service_field_id': 10,
        'value': {'value': this.serviceForm.controls['amount_fixed'].value}
      });
    }

    this._consumptionService.createService(this.communityId, data).subscribe((response) => {
      this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
        .takeUntil(this.componentDestroyed)
        .subscribe((translation: string) => {
          this._toasterService.pop('success',
            translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
          this.clearForm();
          this.isUploading = false;
        });
    }, (error) => {
      this.isUploading = false;
      this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
        .takeUntil(this.componentDestroyed)
        .subscribe((res: string) => {
          this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
        });
      console.log(error);
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }
}
