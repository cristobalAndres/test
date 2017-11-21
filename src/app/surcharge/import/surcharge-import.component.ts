import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../services/settings.service';
import { toasterConfig } from '../../app.config';
import { SurchargeService } from '../surcharge.service'
import { PeriodService } from '../../services/period.service'
import { Subject } from 'rxjs/Subject';
import { ConfirmControlComponent } from '../../controls/confirm-control/confirm-control.component'
import * as moment from 'moment/moment'
import { Observable } from 'rxjs/Rx';


@Component({
  selector: 'app-initial-balance-import',
  templateUrl: './surcharge-import.component.html',
  styleUrls: ['./surcharge-import.component.scss']
})

export class SurchargeImportComponent implements OnInit {
  @ViewChild(ConfirmControlComponent) confirmControl: ConfirmControlComponent;
  private componentDestroyed: Subject<boolean> = new Subject();
  formParams: FormGroup;
  toasterConfig: ToasterConfig = toasterConfig;
  isLocked: boolean = false;
  isShowResult: boolean = false;
  isLoaded: boolean = false;
  isOneSurcharge: boolean = true;
  timer: any;
  isError: boolean = false;
  communityId: number;
  userEmail: string;
  importError: any = null;
  EJ_SHORTID: string = 'ry96kXE9W';
  isUploading: boolean = false;
  dataResume: any[] = [];
  dataCotegories: any[] = [];
  dataFunds: any[] = [];
  periods: any[] = [];
  statusCheckerTimeout: any;
  dateNow: string;
  types: any[] = [];
  UUID: string;

  constructor(private _fb: FormBuilder,
              public _toasterService: ToasterService,
              private _settingService: SettingsService,
              private _translateService: TranslateService,
              private _surchargeService: SurchargeService,
              private _periodService: PeriodService,) {
    this.dateNow = moment(new Date().toISOString()).format();
  }

  resetForm() {
    this.formParams = this._fb.group({
      surcharge_category_id: ['', Validators.required],
      description: [null, Validators.required],
      fund_id: ['', Validators.required],
      recurrent: false,
      period: ['', Validators.required],
      surcharge_type: ['', Validators.required],
    });
    this.formParams.get('surcharge_type').valueChanges.subscribe(data => this.OnTypeSelected(data));
  }

  ngOnInit() {
    this.resetForm();
    this.communityId = +localStorage.getItem('communityId');
    this.statusProcessActive();
    this.getDataForm();
    this.userEmail = JSON.parse(localStorage.getItem('currentUser')).email;
  }

  OnTypeSelected(value) {
    const typeSurchage: any = this.types.find((type) => {
      return type.id === +value;
    });
    if (typeSurchage.slug === 'INMEDIATO') {
      this.isOneSurcharge = true;
      this.formParams.controls['period'].setValue(this.periods[0].period);
      this.formParams.controls['recurrent'].setValue(false);
    } else {
      this.isOneSurcharge = false;
    }
  };

  initSurchageType() {
    this.formParams.controls['surcharge_type'].setValue(this.types[0].id);
  };

  getDataForm() {
    const getSettings = this._settingService.getSettings(this.communityId);
    const getCategories = this._surchargeService.getCategory(this.communityId);
    const getTypes = this._surchargeService.getTypes(this.communityId);
    const getFunds = this._surchargeService.getFunds(this.communityId);
    const getFuturePeriod = this._periodService.getFuturePeriods(this.dateNow);

    getSettings.concatMap(setting => {
      const settings = setting.json();
      const currentPeriodSetting = settings.find(x => x.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD');
      const currentPeriod = currentPeriodSetting.value;
      const firstPeriodSetting = settings.find(x => x.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD');
      const initPeriod = firstPeriodSetting.value.replace('-', '');

      return Observable.forkJoin(
        getCategories,
        getTypes,
        getFunds,
        this._periodService.getFuturePeriods(currentPeriod ? moment(currentPeriod, 'YYYYMM').format() : this.dateNow, 12))
    })
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          this.dataCotegories = data[0].json();
          this.types = data[1].json();
          this.dataFunds = data[2].json();
          this.periods = data[3];
          this.isLoaded = true;
          this.initSurchageType();
        },
        error => {
          const RESPONSE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', RESPONSE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[RESPONSE_ERROR_MESSAGE]);
            });
        })
  }

  onProccessFile(file) {
    this.isUploading = true;
    this._surchargeService.uploadFile(file, 2)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        (data) => {
          this.isUploading = false;
          this.dataResume = data.json().read;
          this.UUID = data.json().UUID;
          this.isShowResult = true
        },
        (error) => {
          this.isUploading = false;
          this.isError = true;
          this.importError = JSON.parse(error.text());
          const RESPONSE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', RESPONSE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[RESPONSE_ERROR_MESSAGE]);
            });
        })
  }

  acceptImport = () => {
    this.statusProcessActive().then(
      isActive => {
        if (!isActive) {
          const data = this.formParams.value;
          data.uuid = this.UUID;
          data.email = this.userEmail;
          data.period = data.period.toString()
          const createConfirm = this._surchargeService.createConfirm(this.communityId, data);
          const translate = this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS']);
          Observable.forkJoin(
            createConfirm,
            translate)
            .takeUntil(this.componentDestroyed)
            .subscribe(
              result => {
                const translation = result[1];
                this.isUploading = false;
                this.isShowResult = false;
                this.resetForm();
                this.initSurchageType();
                this._toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
              },
              error => {
                const RESPONSE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
                this._translateService.get(['GENERAL.ERROR_TITLE', RESPONSE_ERROR_MESSAGE])
                  .subscribe((res: string) => {
                    this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[RESPONSE_ERROR_MESSAGE]);
                  });
              })
        }
      })

  }

  cancelImport = () => {
    this.isShowResult = false;
  }

  retryImport = () => {
    this.isShowResult = false;
    this.isError = false;
  }

  openModalSaveChange() {
    this._translateService.get([
      'GENERAL.CONFIRMATION_TITLE',
      'INITIAL_BALANCE.IMPORT_SUBMIT.CONFIRMATION_TEXT',
      'GENERAL.SAVE_CHANGES',
      'GENERAL.CLOSE'
    ]).subscribe((traslation) => {
      const options = {
        title: traslation['GENERAL.CONFIRMATION_TITLE'],
        text: traslation['INITIAL_BALANCE.IMPORT_SUBMIT.CONFIRMATION_TEXT'],
        style: 'modal-warning',
        buttons: {
          ok: {
            text: traslation['GENERAL.SAVE_CHANGES'],
          },
          cancel: {
            text: traslation['GENERAL.CLOSE'],
            icon: ''
          }
        },
        onAccept: this.acceptImport,
        // onCancel: this.cancelImport
      };
      this.confirmControl.openModal(options);
    })
  }

  openModalCancelChange() {
    this._translateService.get([
      'GENERAL.INFORMATION_TITLE',
      'INITIAL_BALANCE.IMPORT_SUBMIT.CANCELLATION_TEXT',
      'GENERAL.CANCEL_CHANGES',
      'GENERAL.CLOSE'
    ]).subscribe((traslation) => {
      const options = {
        title: traslation['GENERAL.INFORMATION_TITLE'],
        text: traslation['INITIAL_BALANCE.IMPORT_SUBMIT.CANCELLATION_TEXT'],
        style: 'modal-info',
        buttons: {
          ok: {
            text: traslation['GENERAL.CANCEL_CHANGES'],
            icon: 'fa fa-times',
            style: 'btn btn-danger'
          },
          cancel: {
            text: traslation['GENERAL.CLOSE'],
            icon: ''
          }
        },
        onAccept: this.cancelImport,
        // onCancel: this.cancelImport
      };
      this.confirmControl.openModal(options);
    })
  }

  statusProcessActive() {
    return new Promise((resolve, reject) => {
      this._surchargeService.getIsProcessActive(this.communityId)
        .subscribe((result) => {
          const status: boolean = (result.text() === '"FINISHED"') ? false : true;
          this.isLocked = status;
          if (this.isLocked) {
            this.checkStatus();
          } else {
            clearTimeout(this.timer);
          }
          resolve(status);
        })
    })
  }

  checkStatus(): void {
    if (this.isLocked) {
      this.timer = setTimeout(() => {
        this.statusProcessActive()
      }, 3500);
    }
  }

  checkCategoriesExist(): boolean {
    return this.dataCotegories.length > 0 ? true : false;
  }
}
