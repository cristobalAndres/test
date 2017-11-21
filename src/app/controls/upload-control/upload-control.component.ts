import { Component, OnDestroy, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { UploadControlService } from './upload-control.service'
import { toasterConfig } from '../../app.config';
import { Subject } from 'rxjs/Subject';
import * as FileSaver from 'file-saver';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'app-upload-control',
  templateUrl: './upload-control.component.html',
  styleUrls: ['./upload-control.component.scss']
})

export class UploadControlComponent implements OnInit, OnDestroy {

  @Output()
  onProcessFile: EventEmitter<any> = new EventEmitter();

  @Input()
  shortId: string;

  @Input()
  isUploading: boolean = false;

  private componentDestroyed: Subject<boolean> = new Subject();
  public communityId: number;
  public isGenerating: boolean = false;
  fileToUpload: File;
  uploadedData: any;
  uploadedErrorData: any;
  processStatus: any = { finishedAt: null, startedAt: null, uploadStatus: null, message: null };
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

  constructor(
    private uploadControlService: UploadControlService,
    private toasterService: ToasterService,
    private translateService: TranslateService) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
  }

  fileChangeEvent(fileInput: any): void {
    console.log('FILE - : ', fileInput.target.files[0]);
    this.fileToUpload = (fileInput.target.files.length > 0) ? fileInput.target.files[0] : null;
  }

  acceptImport(): void {
    const upload = this.uploadedData.upload;
  }

  generate(): void {
    this.isGenerating = true;
    this.uploadControlService.generateXLSX(this.communityId, this.shortId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
      data => {
        const file = new Blob([data.blob()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(file, `surcharge-import-${this.communityId}.xlsx`);
      },
      error => {
        this.translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .takeUntil(this.componentDestroyed)
          .subscribe((res: string) => {
            this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
      },
      () => this.isGenerating = false
      );
  }

  upload(): void {
    if (this.fileToUpload) {
      const formData: FormData = new FormData();
      formData.append('file', this.fileToUpload);
      this.onProcessFile.emit(formData);
    }
  }

  ngOnDestroy(): void {
    this.isProcessingData = false;
    clearTimeout(this.statusCheckerTimeout);
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }
}

