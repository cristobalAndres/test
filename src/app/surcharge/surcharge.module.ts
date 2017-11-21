import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurchargeCategoryComponent } from './category/surcharge-category.component';
import { SurchargeRoutingModule } from './surcharge-routing.module';
import { HttpModule, Http } from '@angular/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SettingsService } from '../services/settings.service';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToasterModule, ToasterService } from 'angular2-toaster/angular2-toaster';
import { SurchargeService } from './surcharge.service';
import { UploadControlComponent } from '../controls/upload-control/upload-control.component';
import { UploadControlService } from '../controls/upload-control/upload-control.service';
import { SurchargeImportComponent } from './import/surcharge-import.component';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { NumberFormatPipe } from '../pipes/numberformat.pipe';
import { PeriodModule } from '../pipes/period.module';
import { PeriodPipe } from '../pipes/period.pipe'


import { DataTableModule } from 'angular2-datatable';
import { PeriodService } from '../services/period.service';
import { ConfirmControlModule } from '../controls/confirm-control/confirm-control.module';
import { SurchargeListComponent } from './list/surcharge-list.component';
import { DataFilterModule } from '../pipes/datafilter.module';
import { AuthGuard } from '../_guards/auth.guard';

@NgModule({
  imports: [
    DataTableModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToasterModule,
    NumberFormatModule,
    ConfirmControlModule,
    PeriodModule,
    DataFilterModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    SurchargeRoutingModule
  ],
  providers: [
    UploadControlService,
    PeriodService,
    ToasterModule,
    SurchargeService,
    PeriodPipe,
    NumberFormatPipe,
    SettingsService, AuthGuard
  ],
  declarations: [
    SurchargeCategoryComponent,
    SurchargeImportComponent,
    UploadControlComponent,
    SurchargeListComponent,
    SurchargeImportComponent,
    UploadControlComponent]
})
export class SurchargeModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
}
