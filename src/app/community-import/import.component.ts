import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommunityImportService } from './import.service';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { toasterConfig } from '../app.config';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';

@Component({
  selector: 'app-community-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class CommunityImportComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  communityId: number;
  fileToUpload: File;
  uploadedData: any;
  uploadedErrorData: any[];
  processStatus: any = { communityId: null, finishedAt: null, startedAt: null, uploadStatus: null, message: null };
  isUploading: boolean = false;
  isProcessingData: boolean = false;
  statusCheckerTimeout: any;
  isInit: boolean = true;
  toasterConfig = toasterConfig;

  public status = {
    property_count: 0,
    units_count: 0,
    sum_factor_unit: 0,
    detail_total_property: [],
    detail_unit: [],
    units_type: [],
    units: []
  };

  constructor(private communityImportService: CommunityImportService,
              private toasterService: ToasterService, private translateService: TranslateService) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.processValidation();
    this.resetStatus();
  }

  resetStatus(): void {
    this.status = {
      property_count: 0,
      units_count: 0,
      sum_factor_unit: 0,
      detail_total_property: [],
      detail_unit: [],
      units_type: [],
      units: []
    };
  }

  processValidation(): void {
    this.communityImportService.isProcessing(this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        res => {
          this.processStatus = res.json();
          switch (this.processStatus.uploadStatus) {
            case 'IN_PROGRESS':
              this.isProcessingData = true;
              break;
            case 'FINISHED':
              this.isProcessingData = false;
              if (!this.isInit) {
                this.translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
                  .takeUntil(this.componentDestroyed)
                  .subscribe((translation: string) => {
                    this.toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
                  });
              }
              break;
            case 'ERROR':
              this.isProcessingData = false;
              if (!this.isInit) {
                this.translateService.get('GENERAL.ERROR_TITLE')
                  .takeUntil(this.componentDestroyed)
                  .subscribe((translation: string) => {
                    this.toasterService.pop('error', translation, this.processStatus.message);
                  });
              }
              break;
          }
          this.isInit = false;
          console.log(this.processStatus);
        },
        error => {
          this.isProcessingData = false;
          this.processStatus = error.json();
          if (error.json().uploadStatus !== 'STATUS_NOT_FOUND') {
            this.translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
              .takeUntil(this.componentDestroyed)
              .subscribe((res: string) => {
                this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
              });
          }
        },
        () => this.checkStatus()
      );
  }

  checkStatus(): void {
    if (this.isProcessingData) {
      this.statusCheckerTimeout = setTimeout(() => {
        this.processValidation();
      }, 3500);
    }
  }

  fileChangeEvent(fileInput: any): void {
    this.fileToUpload = (fileInput.target.files.length > 0) ? fileInput.target.files[0] : null;
  }

  acceptImport(): void {
    this.communityImportService
      .acceptImport(Object.assign(this.uploadedData.upload, { confirmTo: 'javier.teillier@kastor.cl' }), this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        () => {
          this.uploadedData = null;
          this.uploadedErrorData = null;
          this.isProcessingData = true;
          this.resetStatus();

          this.translateService.get(['GENERAL.INFORMATION_TITLE', 'GENERAL.PROCESS_START'])
            .takeUntil(this.componentDestroyed)
            .subscribe((res: string) => {
              this.toasterService.pop('info', res['GENERAL.INFORMATION_TITLE'], res['GENERAL.PROCESS_START']);
            });
        },
        error => {
          this.isProcessingData = false;
          this.translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
            .takeUntil(this.componentDestroyed)
            .subscribe((res: string) => {
              this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
            });
        },
        () => this.checkStatus()
      );
  }

  cancelImport(): void {
    this.communityImportService.cancelImport(this.uploadedData.upload, this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        () => {
          this.uploadedData = null;
          this.uploadedErrorData = null;
          this.resetStatus();

          this.translateService.get(['GENERAL.INFORMATION_TITLE', 'GENERAL.NOTIFICATION.CANCELLED'])
            .takeUntil(this.componentDestroyed)
            .subscribe((res: string | any) => {
              this.toasterService.pop('info', res['GENERAL.INFORMATION_TITLE'], res['GENERAL.NOTIFICATION.CANCELLED']);
            });
        },
        error => {
          this.translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
            .takeUntil(this.componentDestroyed)
            .subscribe((res: string) => {
              this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
            });
        }
      );
  }

  stats(): void {
    _.forEach(this.uploadedData.data, property => {
      _.forEach(property.units, unit => {
        this.status.units.push(unit);
      });
    });

    console.log(this.uploadedData.data);

    this.status.property_count = this.uploadedData.data.length;
    this.status.units_count = this.status.units.length;
    this.status.units_type = _.countBy(this.status.units, 'unitType.name');
    this.status.sum_factor_unit = _.sumBy(this.status.units, 'factor');

    _.map(this.status.units_type, (k, v) => {
      this.status.detail_unit.push({
        quantity_unit: k,
        type: `UNITS.TYPES.${v.toUpperCase()}.PLURAL`
      });
    });

    this.status.detail_total_property.push({
      type: 'COMMUNITY.IMPORT_SUCCESS.TOTAL_PROPERTIES',
      total: this.status.property_count,
      style: 'info',
      icon: 'fa-building',
      pipe: 1
    });

    this.status.detail_total_property.push({
      type: 'COMMUNITY.IMPORT_SUCCESS.TOTAL_UNITS',
      total: this.status.units_count,
      style: 'danger',
      icon: 'fa-building-o',
      pipe: 1
    });

    this.status.detail_total_property.push({
      type: 'COMMUNITY.IMPORT_SUCCESS.TOTAL_FACTOR',
      total: this.status.sum_factor_unit,
      style: 'primary',
      icon: 'fa-percent',
      pipe: 2
    });

  }

  upload(): void {
    if (this.fileToUpload) {
      const formData: FormData = new FormData();
      formData.append('file', this.fileToUpload);

      this.isUploading = true;
      this.uploadedData = null;
      this.uploadedErrorData = null;

      this.communityImportService.uploadFile(formData, this.communityId)
        .takeUntil(this.componentDestroyed)
        .subscribe(
          data => {
            this.isUploading = false;
            this.uploadedData = data.json();

            if (this.uploadedData.data.length === 0) {
              this.translateService.get(['GENERAL.ERROR_TITLE', 'COMMUNITY.IMPORT_SUBMIT_STATUS.UPLOAD_LENGTH_ZERO'])
                .takeUntil(this.componentDestroyed)
                .subscribe((res: string) => {
                  this.uploadedData = null;
                  this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['COMMUNITY.IMPORT_SUBMIT_STATUS.UPLOAD_LENGTH_ZERO']);
                });
            } else {
              this.stats();
            }
          },
          error => {
            this.isUploading = false;
            const data = error.json();
            const messageKey = data.status ? 'COMMUNITY.IMPORT_SUBMIT_STATUS.' + data.status : 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';

            this.translateService.get(['GENERAL.ERROR_TITLE', messageKey])
              .takeUntil(this.componentDestroyed)
              .subscribe((res: string) => {
                switch (+error.status) {
                  case 404:
                    this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[messageKey]);
                    break;
                  case 500:
                    this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[messageKey]);
                    break;
                  case 400:
                    this.uploadedErrorData = error.json();
                    break;
                  default:
                    this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[messageKey]);
                    break;
                }
              });
          }
        );
    }
  }

  closeImportErrors(): void {
    this.uploadedErrorData = null;
  }

  ngOnDestroy(): void {
    this.isProcessingData = false;
    clearTimeout(this.statusCheckerTimeout);
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }
}

