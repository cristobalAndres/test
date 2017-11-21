import { Component, OnInit } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { SectorService} from '../../services/sector.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  filterQuery: '';
  data: any = [];
  communityId: number;
  isLoading: boolean = false;
  totalFactor: number = 0;

  constructor(private _translateService: TranslateService,
              public _toasterService: ToasterService,
              public _sectorService: SectorService) { }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.getList();
  }

  getList() {
    this.isLoading = true;
     this._sectorService.getUnitsBySectors(this.communityId)
      .subscribe(
        (result) => {
          this.isLoading = false;
          this.data = result.json();
          this.data.forEach((sectors) => {
            if (sectors.units.length > 0) {
              sectors.units.forEach((i) => {
                this.totalFactor = (+this.totalFactor) + (+i.unit_sector.factor);
                i.unit_sector.factor = +i.unit_sector.factor;
              });
            }
            sectors.totalFactor = this.totalFactor;
            this.totalFactor = 0;
          });
        }, (error) => {
          this.isLoading = false;
        })

  }

}
