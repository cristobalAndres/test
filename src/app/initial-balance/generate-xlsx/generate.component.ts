import { Component, OnInit, OnDestroy } from '@angular/core';
import { InitialBalanceImportService } from '../../services/import.service';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-initial-balance-generate-xlsx',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class InitialBalanceGenerateXLSXComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  public communityId: number;
  public isGenerating: boolean = false;

  constructor(private initialBalanceImportService: InitialBalanceImportService,
              private toasterService: ToasterService, private translateService: TranslateService) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
  }

  generate(): void {
    this.isGenerating = true;
    this.initialBalanceImportService.generateXLSX(this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          const file = new Blob([data.blob()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          FileSaver.saveAs(file, `initial-balance-community-${this.communityId}.xlsx`);
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

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

}
