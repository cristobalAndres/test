import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { PropertyService } from '../../services/property.service';
import { Property, PropertyView } from '../../models/property.model';
import { Factor } from '../../models/factor.model';
import { toasterConfig } from '../../app.config';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  communityId: number;
  public data: PropertyView[] = [];
  public filterQuery = '';
  toasterConfig = toasterConfig;
  public selectedPropertyForDelete: PropertyView = null;
  public selectedProperty: PropertyView = new PropertyView(new Property);
  public deleteModalParam = {
    value: ''
  };
  private subscription: Subscription = new Subscription();
  public factorTotals: Factor[];

  constructor(private propertyService: PropertyService,
              private toasterService: ToasterService,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.communityId = +localStorage.getItem('communityId');
    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getAll(): void {
    this.subscription.add(this.propertyService.all(this.communityId)
      .subscribe(
        data => {
          const properties = data.json() as Property[];
          properties.forEach(property => {
            this.data.push(new PropertyView(property));
          })
          this.calculateFactorTotals(properties);
          this.orderFactorTotalsBySlug();
          console.log(this.data);
        }
      ));
  }

  selectPropertyForDelete(propertyView: PropertyView): void {
    this.selectedPropertyForDelete = propertyView;
    this.deleteModalParam.value = propertyView.name;
  }

  deselectPropertyForDelete(): void {
    this.selectedPropertyForDelete = null;
    this.deleteModalParam.value = '';
  }

  deleteProperty(): void {
    this.subscription.add(this.propertyService.deleteById(this.communityId, this.selectedPropertyForDelete.id)
      .subscribe(
        deleted => {
          this.translateService.get(['GENERAL.SUCCESS_TITLE', 'PROPERTY.DELETE.SUCCESS'])
            .subscribe((res: string) => {
              this.toasterService.pop('success', res['GENERAL.SUCCESS_TITLE'], res['PROPERTY.DELETE.SUCCESS']);
            });
          this.data = this.data.filter((x: PropertyView) => x.id !== this.selectedPropertyForDelete.id)
        },
        error => {
          const DELETE_ERROR_MESSAGE = 'PROPERTY.DELETE.ERRORS.' + error.json().message;
          this.translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
            });
          this.deselectPropertyForDelete();
        },
        () => this.deselectPropertyForDelete()
      ));
  }

  calculateFactorTotals(properties: Property[]): void {
    this.factorTotals = [];
    properties.forEach((property) => {
      property.factors.forEach((factor, index) => {
        const slugKey = this.factorTotals.findIndex(el => (el.slug === factor.slug));
        if (slugKey < 0) {
          const newFactor: Factor = {
            slug: factor.slug,
            name: factor.name,
            factor: factor.factor
          };
          this.factorTotals.push(newFactor);
        } else {
          this.factorTotals[slugKey].factor += +factor.factor;
        }
      });
    });
  }

  orderFactorTotalsBySlug() {
    this.factorTotals = this.factorTotals.sort((o1, o2) => {
      if (o1.slug === 'DEFAULT_SECTOR') {
        return -1;
      }
      if (o2.slug === 'DEFAULT_SECTOR') {
        return 1;
      }
      return o1.slug.localeCompare(o2.slug, undefined, {numeric: true, sensitivity: 'base'});
    });
  }

  showModal(item: PropertyView): void {
    this.selectedProperty = item;
    console.log(this.selectedProperty);
  }

}
