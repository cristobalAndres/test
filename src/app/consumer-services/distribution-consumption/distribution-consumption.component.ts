import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

// Services
import { SettingsService } from '../../services/settings.service';
import { SectorService } from '../../services/sector.service';
import { SuppliersService } from '../../services/suppliers.service';
import { PeriodService } from '../../services/period.service';
import { ConsumerServicesService } from '../../services/consumer-services.service';
import { CommunityService } from '../../services/community.service';

// Models
import { Supplier } from '../../models/supplier.model';
import { Sector } from '../../models/sector.model';
import { Period } from '../../models/period.model';
import * as moment from 'moment/moment'

@Component({
  selector: 'app-distribution-consumption',
  templateUrl: './distribution-consumption.component.html',
  styleUrls: ['./distribution-consumption.component.scss']
})
export class DistributionConsumptionComponent implements OnInit, OnDestroy {

  // variables
  @ViewChild(ModalDirective) public confirmationTupla: ModalDirective;
  public formDistribution: FormGroup;
  public communityId: number;
  public componentDestroyed: Subject<boolean> = new Subject();
  public sectors: Sector[];
  public sectorSelected: Sector;
  public suppliers: Supplier[];
  public supplierSelected: Supplier;
  public distributionTypes: any[];
  public distributionTypeSelected: any = { name: '' };
  public fixedCharges: any[];
  public fixedChargeSelected: any = { name: '' };
  public isLoading: Boolean = true;
  public headersConsumerServices: any[];
  public bodysConsumerServices: any[] = [];
  public periods: Period[];
  public disabledButtonSend: Boolean = true;
  public messageModal: any = {
    sector: '',
    proveedor: ''
  };
  public showUnits: boolean = false;
  public units: any[];

  constructor(
    private _fb: FormBuilder,
    private _settingService: SettingsService,
    private _toasterService: ToasterService,
    private _sectorService: SectorService,
    private _supplierService: SuppliersService,
    private _translateService: TranslateService,
    private _periodService: PeriodService,
    private _consumerServicesService: ConsumerServicesService,
    private _comunityService: CommunityService
  ) { }

  ngOnInit() {
    this.initFormDistribution();
    this.communityId = +localStorage.getItem('communityId');
    this.getInitView();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  // iniciamos formBuilder vista
  public initFormDistribution(): void {
    this.formDistribution = this._fb.group({
      sector: [new Sector, Validators.required],
      supplier: [new Supplier, Validators.required],
      distributionType: null,
      fixedCharge: [null, Validators.required],
      distributions: this._fb.array([]),
      typeUnits: this._fb.array([]),
    });
  }

  // añadir objeto dinamico al formulario
  addAssign() {
    const control = <FormArray>this.formDistribution.controls['distributions'];
    const addrCtrl = this.initAssign();
    control.push(addrCtrl);
    this.bodysConsumerServices.forEach((consumerServices, _index) => {
      this.addConsumerServices(control, 0, consumerServices);
    });
  }

  initAssign() {
    return this._fb.group({
      distributionType: null,
      consumerServices: this._fb.array([]),
      fixedChargeAmount: 0,
      total: 0,
      state: false
    });
  }

  // añadir objeto dinamico al formulario
  addAssignMonth(period: any, _month: number) {
    const control = <FormArray>this.formDistribution.controls['distributions'];
    const addrCtrl = this.initAssignMonth(period);
    control.push(addrCtrl);
    this.bodysConsumerServices.forEach((consumerServices, _index) => {
      this.addConsumerServices(control, _month, consumerServices);
    });
  }

  initAssignMonth(period: any) {
    return this._fb.group({
      distributionType: null,
      consumerServices: this._fb.array([]),
      fixedChargeAmount: 0,
      total: 0,
      month: period.number,
      monthName: period.name,
      state: false
    });
  }

  initUnitCommunity(id: number, name: string, active: boolean = false, selected: boolean = false) {
    return this._fb.group({
      id: id,
      name: name,
      active: active,
      selected: selected,
    })
  }

  public changeUnit(unit: any): void {
    console.log('changeUnit():', unit);
    const arrayUnits = this.formDistribution.controls['typeUnits'].value;
    if (arrayUnits === null) {
      this.formDistribution.controls['typeUnits'].value.push(unit.id);
    } else {
      const position = arrayUnits.indexOf(unit.id);
      if (position === -1) {
        this.formDistribution.controls['typeUnits'].value.push(unit.id);
      } else {
        const ctrl = this.formDistribution.controls['typeUnits'].value;
        ctrl.splice(position, 1);
      }
    }
    this.disabledButtonSend = this.validateAmountDistributionGlobal();
  };

  // añadir objeto dinamico al formulario
  addConsumerServices(form: any, _index?: number, consumerServices?: any) {
    const control = <FormArray>form['controls'][_index]['controls'].consumerServices;
    const addrCtrl = this.initConsumerServices(consumerServices);
    control.push(addrCtrl);
  }

  initConsumerServices(consumerServices?: any) {
    return this._fb.group({
      id: [consumerServices.id, Validators.required],
      amount: [0, Validators.required]
    });
  }

  // eliminamos elementos de lista dinamica de objetos
  removeAllFees(form: any) {
    const countFee = form.distributions.length;
    if (countFee !== 0) {
      const promise = new Promise((resolve, reject) => {
        for (let _i = (countFee); _i >= 0; _i--) {
          this.removeFee(_i);
        }
      });
      return promise;
    }
  }

  // eliminamos elemento seleccionado
  removeFee(i: number) {
    const ctrl = <FormArray>this.formDistribution.controls['distributions'];
    ctrl.removeAt(i);
  }

  public refreshConsumerServices(distributionTypeSelected: any): void {
    this.removeAllFees(this.formDistribution.value);
    if (distributionTypeSelected.name === 'MONTHLY') {
      this.periods.forEach((period, _month) => {
        this.addAssignMonth(period, _month);
      });
    }
    if (distributionTypeSelected.name === 'FIXED') {
      this.addAssign();
    }
    this.disabledButtonSend = this.validateAmountDistributionGlobal();
  }

  // verificamos que la tupla sector proveedor no exista en BD
  public getTupla(origin: string): void {
    if (this.supplierSelected) {
      this._consumerServicesService.verifyTypla(this.communityId, this.sectorSelected.id, this.supplierSelected.id)
        .subscribe(
        res => {
          if (res.json()[0]) {
            const existsTupla = res.json()[0];
            if (existsTupla.consumer_service_distributions.length > 0) {
              if (this.sectorSelected.name === 'DEFAULT_SECTOR') {
                this._translateService.get(['SECTOR.GENERAL.' + this.sectorSelected.name, 'SECTOR.GENERAL.' + this.sectorSelected.name])
                  .subscribe((translation: string) => {
                    this.messageModal.sector = translation['SECTOR.GENERAL.' + this.sectorSelected.name];
                    this.messageModal.proveedor = this.supplierSelected.name;
                    this.confirmationTupla.show();
                  });
              } else {
                this.messageModal.sector = this.sectorSelected.name;
                this.messageModal.proveedor = this.supplierSelected.name;
                this.confirmationTupla.show();
              }
            }
          }
        },
        err => console.log(err));
    } else {
      this._translateService.get(['GENERAL.INFORMATION_TITLE', 'CONSUMER_SERVICES.DISTRIBUTION_CONSUMPTION.MESSAGE_SUPPLIER'])
        .subscribe((translation: string) => {
          this._toasterService.pop('info', translation['GENERAL.INFORMATION_TITLE'], translation['CONSUMER_SERVICES.DISTRIBUTION_CONSUMPTION.MESSAGE_SUPPLIER']);
        });
    }
    if (origin === 'sector') {
      this.getConsumerServices();
      this.disabledButtonSend = true;
    }
  }

  public deselectDistributionMessage(): void {
    this.messageModal.sector = '';
    this.messageModal.proveedor = '';
  }

  // iniciamos servicios para vista creación de distribuciones de consumo
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
      const getSuppliers = this._supplierService.getAll();
      const getPeriods = this._periodService.getFuturePeriods(moment(currentPeriod, 'YYYYMM').format(), 12);
      const getFields = this._consumerServicesService.getAll();
      // traemos las unidades disponibles para la comunidad
      const getUnits = this._comunityService.getUnits(this.communityId);
      return Observable.forkJoin(
        getSectors.map(sector => sector.json() as Sector[]),
        getSuppliers.map(debtsType => debtsType.json() as Supplier[]),
        getPeriods,
        getFields,
        getUnits.map(units => units.json()));
    })
      .takeUntil(this.componentDestroyed)
      .subscribe(res => {
        // rescatamos sectores
        this.sectors = res[0];
        if (this.sectors) {
          this.sectorSelected = this.sectors[0];
        }

        // traemos consumer_services para sector seleccionado
        this.getConsumerServices();

        // rescatamos conceptos de deuda
        this.suppliers = res[1];

        // rescatamos periodos
        this.periods = res[2];

        // rescatamos fields tipo de distribución
        this.distributionTypes = res[3].json().filter(f => f.key === 'DISTRIBUTION_TYPE');
        if (this.distributionTypes) {
          this.distributionTypeSelected = this.distributionTypes[0];
        }

        // rescatamos fields tipo de cargo fijo afecto
        this.fixedCharges = res[3].json().filter(f => f.key === 'FIXED_CHARGED_TYPE');
        if (this.fixedCharges) {
          this.fixedChargeSelected = this.fixedCharges[0];
        }
        // asignamos los tipos de unidades del condominio
        this.units = res[4];

        this.isLoading = false;
      }, error => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
        this.isLoading = false;
      });
  }

  public getConsumerServices(): void {
    this._consumerServicesService.getConsumerServices(this.sectorSelected.id)
      .subscribe(res => {
        this.headersConsumerServices = res.json();
        this.bodysConsumerServices = res.json();
        const datos = this.formDistribution.value;
        this.removeAllFees(this.formDistribution.value);
        if (this.distributionTypeSelected.name === 'MONTHLY') {
          this.periods.forEach((period, _month) => {
            this.addAssignMonth(period, _month);
          });
        }
        if (this.distributionTypeSelected.name === 'FIXED') {
          this.addAssign();
        }
      }, err => console.log(err));
  }

  public validateAmountDistribution(distribution: any, distributionBinding: any, toaster: Boolean): void {
    distribution.consumerServices.forEach((consumerService, _i) => {
      if (consumerService.amount === null) {
        distributionBinding['controls'].consumerServices['controls'][_i]['controls'].amount.setValue(0);
      }
    });
    if (!distribution.fixedChargeAmount) {
      distributionBinding['controls'].fixedChargeAmount.setValue(0);
    }

    distributionBinding.state = false;
    const sumAmounts = this.calculateTotal(distribution);
    if (sumAmounts !== 100) {
      distributionBinding.state = true;
    }
    if (sumAmounts !== 100 && toaster) {
      this._translateService.get(['GENERAL.ERROR_TITLE', 'CONSUMER_SERVICES.MODAL_CONFIRMATION.MESSAGE_AMONT'])
        .subscribe((translation: string) => {
          this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['CONSUMER_SERVICES.MODAL_CONFIRMATION.MESSAGE_AMONT']);
        });
    }
    this.disabledButtonSend = this.validateAmountDistributionGlobal();
  }

  public validateAmountDistributionGlobal(): Boolean {
    if (this.fixedChargeSelected.name === 'PROPERTY') {
      const datos = this.formDistribution.controls['typeUnits'].value;
      if (datos.length === 0) {
        return true;
      }
    }

    if (this.distributionTypeSelected.name === 'FIXED') {
      let sum = 0;
      this.formDistribution.value.distributions.forEach(dis => {
        dis.consumerServices.forEach(item => {
          sum = (+sum) + (+item.amount);
        });
        sum = (+sum) + (+dis.fixedChargeAmount);
      });
      if ((+sum) === 100) {
        return false;
      } else {
        return true;
      }
    }
    if (this.distributionTypeSelected.name === 'MONTHLY') {
      const datos = this.formDistribution.controls['distributions'].value;
      const countMonth = datos.filter(d => {
        let sumConsumerServices = 0;
        d.consumerServices.forEach(c => {
          sumConsumerServices = (+sumConsumerServices) + (+c.amount);
        });
        sumConsumerServices = (+sumConsumerServices) + (+d.fixedChargeAmount);
        if (sumConsumerServices === 100) {
          return d;
        }
      });
      if (countMonth.length === 12) {
        return false;
      } else {
        return true;
      }
    }
  }

  public changeFixedCharge(): void {
    if (this.fixedChargeSelected.name === 'PROPERTY') {
      this.showUnits = true;
    } else {
      this.showUnits = false;
      if (this.fixedChargeSelected.name === 'NONE') {
        this.formDistribution.value.distributions.forEach((consumerServiceItem, _index) => {
          this.formDistribution['controls'].distributions['controls'][_index]['controls'].total.setValue((consumerServiceItem.total - consumerServiceItem.fixedChargeAmount));
          this.formDistribution['controls'].distributions['controls'][_index]['controls'].fixedChargeAmount.setValue(0);
        });
      }
    }
    this.disabledButtonSend = this.validateAmountDistributionGlobal();
  }

  public calculateTotal(distribution: any): number {
    let sum = 0;
    if (distribution) {
      distribution.consumerServices.forEach(consumerServiceItem => {
        sum = (+sum) + (+consumerServiceItem.amount);
      });

      sum = (+sum) + (+distribution.fixedChargeAmount);
    }
    distribution.total = sum;

    return sum;
  }

  onSubmit(formDistribution: any): void {
    this.isLoading = true;
    formDistribution.fixedCharge.unit_types = formDistribution.typeUnits;
    delete formDistribution.typeUnits;
    this._consumerServicesService.postDistributions(formDistribution)
      .subscribe(res => {
        this.isLoading = false;
        this.refreshConsumerServices(this.distributionTypeSelected);
        this.units.forEach(unit => unit.selected = false);
        // gestionar respuesta
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            this._toasterService.pop('success',
              translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
          });
      }, err => {
        this.isLoading = false;
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
      });
  }
}
