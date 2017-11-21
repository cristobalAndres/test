import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { toasterConfig } from '../../app.config';
import { PeriodPipe } from '../../pipes/period.pipe'
import { SurchargeService } from './../surcharge.service';
import { BillCategory } from '../../models/bill-category';
import { Subject } from 'rxjs/Subject';

import * as moment from 'moment/moment';

@Component({
  selector: 'app-surcharge',
  templateUrl: './surcharge-category.component.html',
  styleUrls: ['./surcharge-category.component.scss']
})
export class SurchargeCategoryComponent implements OnInit, OnDestroy {

  ngForm: FormGroup;
  toasterConfig: ToasterConfig = toasterConfig;
  communityId: number;
  public billCategory: BillCategory;
  categories: any = [];
  isLoading: boolean = true;
  filterQuery: '';
  private componentDestroyed: Subject<boolean> = new Subject();
  itemSelectedToDelete: any = null;
  deleteModalParam = {
    value: ''
  };

  constructor(fb: FormBuilder,
              private surchargeService: SurchargeService,
              private translateService: TranslateService,
              private periodPipe: PeriodPipe,
              private toasterService: ToasterService) {
    this.ngForm = fb.group({
      'name': [null, Validators.required],
    });
    this.billCategory = new BillCategory;
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.loadCategories();
    this.communityId = +localStorage.getItem('communityId');
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  formatDate(date: string): string {
    return moment(date).format('DD-MM-YYYY');
  }

  loadCategories() {
    this.isLoading = true;
    this.deleteModalParam.value = '';
    this.surchargeService.getCategory(this.communityId, true)
      .takeUntil(this.componentDestroyed).subscribe((data) => {
      this.categories = [];
      const result = data.json();
      result.forEach(item => {
        const row = item;
        row.created_at_format = this.formatDate(row.created_at);
        this.categories.push(row);
      });
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      this.translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
        .takeUntil(this.componentDestroyed)
        .subscribe((res: string) => {
          this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
        });
    })
  };

  selectToDelete(item: any) {
    this.itemSelectedToDelete = item;
    this.deleteModalParam.value = `'${item.name}'`;
  }

  cancelDelete() {
    this.itemSelectedToDelete = null;
    this.deleteModalParam.value = '';
  }

  deleteCategory() {
    this.isLoading = true;
    this.surchargeService.deleteCategory(this.communityId, this.itemSelectedToDelete.id)
      .takeUntil(this.componentDestroyed)
      .subscribe((data) => {
        this.translateService.get(['GENERAL.SUCCESS_TITLE', 'SURCHARGE.CATEGORY_SURCHARGE.DELETE_CATEGORY_SURCHARGE_SUCCESS'])
          .subscribe((translation: string) => {
            this.toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['SURCHARGE.CATEGORY_SURCHARGE.DELETE_CATEGORY_SURCHARGE_SUCCESS']);
          });
        this.ngForm.reset();
        this.loadCategories();
      }, error => {
        console.log(error);
        this.isLoading = false;
        this.translateService.get(['GENERAL.ERROR_TITLE', 'SURCHARGE.CATEGORY_SURCHARGE.DELETE_CATEGORY_SURCHARGE_ERROR'])
          .subscribe((translation: string) => {
            this.toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['SURCHARGE.CATEGORY_SURCHARGE.DELETE_CATEGORY_SURCHARGE_ERROR']);
            this.ngForm.reset();
          });
      });
  }

  onSubmit(formData: any) {
    formData.active = true;
    formData.community_id = this.communityId;
    this.surchargeService.postCreateCategorySurcharge(formData, this.communityId)
      .subscribe(
        data => {
          this.translateService.get(['GENERAL.SUCCESS_TITLE', 'SURCHARGE.CATEGORY_SURCHARGE.CREATE_CATEGORY_SURCHARGE_SUCCESS'])
            .subscribe((translation: string) => {
              this.toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['SURCHARGE.CATEGORY_SURCHARGE.CREATE_CATEGORY_SURCHARGE_SUCCESS']);
            });
          this.ngForm.reset();
          this.loadCategories();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.translateService.get(['GENERAL.ERROR_TITLE', 'SURCHARGE.CATEGORY_SURCHARGE.CREATE_CATEGORY_SURCHARGE_ERROR'])
            .subscribe((translation: string) => {
              this.toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['SURCHARGE.CATEGORY_SURCHARGE.CREATE_CATEGORY_SURCHARGE_ERROR']);
              this.ngForm.reset();
            });
        });
  }
}
