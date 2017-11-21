import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommunityImportService } from '../import.service';
import { Log } from '../../models/log.model';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-community-import-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class CommunityImportLogComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  public communityId: number;
  public data: Log[] = [];
  public cols: any[] = [];

  constructor(private communityImportService: CommunityImportService) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.get();
  }

  get(): void {
    this.communityImportService.getLog(this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          this.data = data.json();
          console.log(this.data);
          if (this.data.length > 0 && this.data[0].hasOwnProperty('event_log_values')) {
            this.data = this.data.map(el => {
              el.event_log_values = el.event_log_values.filter(val => (val.event_log_field.key !== 'COMMUNITY_UPLOAD_ID'));
              return el;
            });
            if (this.data[0].event_log_values.length > 0) {
              this.cols = this.data[0].event_log_values.map(el => (el.event_log_field.key));
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
