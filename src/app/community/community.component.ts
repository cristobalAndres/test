import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommunityService } from '../services/community.service';
import { Community } from '../models/community.model';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: [ './community.component.scss' ]
})
export class CommunityComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  public data: Community[];
  public filterQuery = '';

  constructor(private communityService: CommunityService) {
  }

  ngOnInit(): void {
    this.getAll();
  }

  getAll(): void {
    this.communityService.all()
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => this.data = data.json() as Community[]
      );
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }
}
