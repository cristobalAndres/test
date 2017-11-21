import { Component, OnInit, OnDestroy } from '@angular/core';
import { InitialBalanceImportService } from '../../services/import.service';
import { Log } from '../../models/log.model';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-initial-balance-import-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class InitialBalanceImportLogComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  public communityId: number;
  public data: Log[] = [];
  public cols: any[] = [];

  constructor(private initialBalanceImportService: InitialBalanceImportService) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.get();
  }

  get (): void {
    this.initialBalanceImportService.getLog(this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          this.data = data.json();
          if (this.data.length > 0 && this.data[0].hasOwnProperty('event_log_values')) {
            if (this.data[0].event_log_values.length > 0) {
              this.cols = this.data[0].event_log_values.map(el => {
                return el.event_log_field.key
              });
            }
          }
        },
        error => console.log(error)
      );
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

}
