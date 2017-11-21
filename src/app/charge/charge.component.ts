import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

// Services
import { SettingsService } from '../services/settings.service';
import { PeriodService } from '../services/period.service';
import { PropertyService } from '../services/property.service';
import { ReportService } from '../services/report.service';
import { SectorService } from '../services/sector.service';
import { TranslateService } from '@ngx-translate/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';

// Models
import { Period } from '../models/period.model';
import { Property } from '../models/property.model';
import { Sector } from '../models/sector.model';

import * as moment from 'moment/moment';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-charge',
  templateUrl: './charge.component.html',
  styleUrls: ['./charge.component.scss']
})
export class ChargeComponent implements OnInit, OnDestroy {

  // variables
  public communityId: number;
  public firstPeriod: number;
  public currentPeriod: number;
  public dateNow: string;
  public componentDestroyed: Subject<boolean> = new Subject();
  public periods: Period[];
  public properties: any = [];
  public total: number = 1000;
  public periodSelected: Period;
  public isLoading: Boolean = false;
  public isLoadingDonwload: Boolean = false;
  public options = {
    consumptionDetail: true,
    consumptionSummary: true,
    lightCutManagement: true,
    sectors: true
  }
  public stateView: Boolean = false;
  public collapseConfig: Boolean = false;
  public widthTable: string = '12000px';
  public totales = [];

  constructor(
    private _periodService: PeriodService,
    private _settingService: SettingsService,
    private _propertyService: PropertyService,
    private _reportService: ReportService,
    private _translateService: TranslateService,
    private _toasterService: ToasterService,
    private _sectorService: SectorService
  ) { }

  ngOnInit() {
    this.totales = [];
    this.communityId = +localStorage.getItem('communityId');
    this.startView();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  public startView(): void {
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
      const getPeriods = this._periodService.getFuturePeriods(this.dateNow, 1, (this.currentPeriod - this.firstPeriod));
      return Observable.forkJoin(
        getPeriods);
    })
      .takeUntil(this.componentDestroyed)
      .subscribe(res => {
        // recuperamos periodos
        this.periods = res[0];
        if (this.periods) {
          this.periodSelected = this.periods.reverse()[0];
        }

        this.isLoading = false;
      }, error => {
        this.isLoading = false;
      });
  }

  public changeCollapse(): void {
    this.stateView = false;
    this.properties = [];
    this.collapseConfig = !this.collapseConfig;
  }

  public selectedOptions(type: string): void {
    if (type === 'consumptionDetail') {
      this.options.consumptionDetail = !this.options.consumptionDetail;
      if (!this.options.consumptionDetail) {
        this.widthTable = '11000px%';
      } else {
        this.widthTable = '12000px';
      }
    }
    if (type === 'consumptionSummary') {
      this.options.consumptionSummary = !this.options.consumptionSummary;
    }
    if (type === 'lightCutManagement') {
      this.options.lightCutManagement = !this.options.lightCutManagement;
    }
    if (type === 'sectors') {
      this.options.sectors = !this.options.sectors;
    }
  }

  // devuelve nombre de responsable de inmuebles
  public userName(user: any): string {
    const userName = `${user.auth_user.name} ${user.auth_user.lastname}`
    return userName;
  }

  public amountSector(sec: Sector, property: any): number {
    let amount = 0;
    const sector = property.sectors.find(s => s.slug === sec.slug);
    if (sector) {
      amount = (+sector.common_expense);
    }
    return amount;
  }

  public generateReportXlsx(): void {
    const totals = [];
    this.isLoadingDonwload = true;
    const totales = this.totales;
    const elements = document.getElementsByClassName('totals');
    for (let i = 0, len = elements.length; i < len; i++) {
      const total = elements[i].innerHTML.trim();
      totals.push({ amount: total });
    };
    this.properties.totals = totals;
    this._reportService.generateCollectionReportXLSX(this.communityId, this.properties)
      .subscribe(res => {
        this.isLoadingDonwload = false;
        const file = new Blob([res.blob()], { type: 'application/xlsx' });
        FileSaver.saveAs(file, `${this.periodSelected.name}.xlsx`);
      }, err => {
        this.isLoadingDonwload = false;
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
      });
  }

  public calculateAmountSectors(property: any): number {
    let amount = 0;
    property.sectors.forEach(sector => {
      amount = amount + (+sector.common_expense_total);
    });
    property.amountSectors = amount;
    return amount;
  }

  public calculateTotals(elementDom: any): number {
    let total = 0;
    const elements = document.getElementsByClassName(`${elementDom}`);
    for (let i = 0, len = elements.length; i < len; i++) {
      const valor = elements[i].innerHTML.trim();
      total = total + (+valor);
    };
    this.totales.push(total);
    return total;
  }

  public generateReportCharges(): void {
    this.isLoading = true;
    this._reportService.generalCollectionReportGeneration(this.communityId, this.periodSelected.period, moment().format('YYYY-MM-DD'))
      .subscribe(res => {
        this.properties = res.json();
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
      });
  }

}
