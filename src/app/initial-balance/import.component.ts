import { Component, OnDestroy, OnInit } from '@angular/core';
import { InitialBalanceImportService } from '../services/import.service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { toasterConfig } from '../app.config';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-initial-balance-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class InitialBalanceImportComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  communityId: number;
  fileToUpload: File;
  uploadedData: any;
  uploadedErrorData: any;
  processStatus: any = {communityId: null, finishedAt: null, startedAt: null, uploadStatus: null, message: null};
  isUploading: boolean = false;
  isProcessingData: boolean = false;
  statusCheckerTimeout: any;
  isInit: boolean = true;
  toasterConfig: ToasterConfig = toasterConfig;
  stats: any = {
    property_count: 0,
    property_total: 0,
    debt_type_amount: {},
    debt_type_keys: []
  };

  constructor(private initialBalanceImportService: InitialBalanceImportService,
              private toasterService: ToasterService, private translateService: TranslateService) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.processValidation();
    this.resetStats();
  }

  resetStats(): void {
    this.stats = {
      property_count: 0,
      property_total: 0,
      debt_type_amount: {},
      debt_type_keys: []
    };
  }

  processValidation(): void {
    this.initialBalanceImportService.isProcessing(this.communityId)
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
                    this.toasterService.pop('success',
                      translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
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
              .subscribe((translation: string) => {
                this.toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
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
    const upload = this.uploadedData.upload;
    this.uploadedData = null;
    this.uploadedErrorData = null;
    this.isProcessingData = true;
    this.resetStats();
    this.initialBalanceImportService
      .acceptImport(Object.assign(upload, {confirmTo: 'javier.teillier@kastor.cl'}), this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        () => {
          this.uploadedData = null;
          this.uploadedErrorData = null;
          this.isProcessingData = true;
          this.resetStats();

          this.translateService.get(['GENERAL.INFORMATION_TITLE', 'GENERAL.PROCESS_START'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this.toasterService.pop('info', translation['GENERAL.INFORMATION_TITLE'], translation['GENERAL.PROCESS_START']);
            });
        },
        error => {
          this.isProcessingData = false;
          this.translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this.toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
            });
        },
        () => this.checkStatus()
      );
  }

  cancelImport(): void {
    this.initialBalanceImportService.cancelImport(this.uploadedData.upload, this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        () => {
          this.uploadedData = null;
          this.uploadedErrorData = null;
          this.resetStats();

          this.translateService.get(['GENERAL.INFORMATION_TITLE', 'GENERAL.NOTIFICATION.CANCELLED'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string | any) => {
              this.toasterService.pop('info', translation['GENERAL.INFORMATION_TITLE'], translation['GENERAL.NOTIFICATION.CANCELLED']);
            });
        },
        error => {
          this.translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this.toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
            });
        }
      );
  }

  updateStats(): void {
    this.stats.property_count = this.uploadedData.data.length;
    this.uploadedData.data.map(el => {
      el.total = 0;
      el.initialBalances.forEach(row => {
        el.total += row.amount;
        if (!this.stats.debt_type_amount.hasOwnProperty(row.debtType.slug)) {
          this.stats.debt_type_amount[row.debtType.slug] = 0;
        }
        this.stats.debt_type_amount[row.debtType.slug] += row.amount;
      });
      this.stats.property_total += el.total;
    });
    this.stats.debt_type_keys = Object.keys(this.stats.debt_type_amount);
  }

  upload(): void {
    if (this.fileToUpload) {
      const formData: FormData = new FormData();
      formData.append('file', this.fileToUpload);
      this.isUploading = true;
      this.uploadedData = null;
      this.uploadedErrorData = null;
      this.initialBalanceImportService.uploadFile(formData, this.communityId)
        .takeUntil(this.componentDestroyed)
        .subscribe(
          data => {
            this.isUploading = false;
            this.uploadedData = data.json();
            if (this.uploadedData.data.length === 0) {
              this.translateService.get(['GENERAL.ERROR_TITLE', 'COMMUNITY.IMPORT_SUBMIT_STATUS.UPLOAD_LENGTH_ZERO'])
                .takeUntil(this.componentDestroyed)
                .subscribe((translation: string) => {
                  this.uploadedData = null;
                  this.toasterService.pop('error',
                    translation['GENERAL.ERROR_TITLE'], translation['COMMUNITY.IMPORT_SUBMIT_STATUS.UPLOAD_LENGTH_ZERO']);
                });
            } else {
              this.updateStats();
            }
          },
          error => {
            this.isUploading = false;
            const data = error.json();
            const messageKey = data.status ? 'COMMUNITY.IMPORT_SUBMIT_STATUS.' + data.status : 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';

            this.translateService.get(['GENERAL.ERROR_TITLE', messageKey])
              .takeUntil(this.componentDestroyed)
              .subscribe((translation: string) => {
                switch (+error.status) {
                  case 404:
                    this.toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                    break;
                  case 500:
                    this.toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                    break;
                  case 400:
                    this.uploadedErrorData = data;
                    break;
                  default:
                    this.toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
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

