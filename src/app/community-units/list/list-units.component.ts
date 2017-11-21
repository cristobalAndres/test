import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

// services
import { CommunityService } from '../../services/community.service';
import { TranslateService } from '@ngx-translate/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';


@Component({
  selector: 'app-list-units',
  templateUrl: './list-units.component.html',
  styleUrls: ['./list-units.component.scss']
})
export class ListUnitsComponent implements OnInit {
  public filterQuery = '';
  public communityId: number;
  public isUploading: boolean = true;
  total_m2: number = 0;
  private componentDestroyed: Subject<boolean> = new Subject();

  units: any = [];
  data: any = [];
  deleteModalParam = {
    value: ''
  };
  selectedUnitForDelete: any = null;
  constructor(private _comunityService: CommunityService,
              private _translateService: TranslateService,
              private _toasterService: ToasterService) {
  };

  ngOnInit() {
    this.getInitValues();
  }

  getInitValues(): void {
    this.communityId = +localStorage.getItem('communityId');
    const getUnits = this._comunityService.getUnitsByCommunity(this.communityId);
    const getDefaultName = this._translateService.get(['SECTOR.GENERAL.DEFAULT_SECTOR']);
    Observable.forkJoin(
      getUnits.map(units => units.json()),
      getDefaultName
    ).takeUntil(this.componentDestroyed)
      .subscribe((response) => {
        this.units = response[0];
        this.isUploading = false;
        const defaultSectorName = response[1]['SECTOR.GENERAL.DEFAULT_SECTOR'];

        this.units.forEach(item => {
          item.owner_full = item.owner.name + ' ' + item.owner.lastname;
          item.property_name = item.property.name;
          item.type = item.unit_type;
          if (item.sectors) {
            item.factor_sector = ' ';
            item.sectors.forEach(sector => {
              item.factor_sector += (sector.name === 'DEFAULT_SECTOR' ? defaultSectorName : sector.name ) + ' ' + sector.factor;
            });
          }
        });
      }, error => {
        // en caso que servicio devuelva error, mostrar alerta
        const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
        this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
          .subscribe((res: string) => {
            this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
          });
        this.isUploading = false;
      });
  };

  selectUnit(unit: any) {
    this.selectedUnitForDelete = unit;
    this.deleteModalParam.value = `'${unit.name}:${unit.property_name}'`;
  }
}
