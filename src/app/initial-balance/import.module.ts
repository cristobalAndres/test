import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InitialBalanceImportRoutingModule } from './import-routing.module';
import { InitialBalanceImportComponent } from './import.component';

import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { ToXLSColumnNameModule } from '../pipes/toxlscolumnname.module';
import { NumberFormatModule } from '../pipes/numberformat.module';

import { InitialBalanceImportService } from '../services/import.service';
import { InitialBalanceImportLogComponent } from './log/log.component';
import { InitialBalanceGenerateXLSXComponent } from './generate-xlsx/generate.component';

import { DataTableModule } from 'angular2-datatable';
import { AccordionModule } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';

import { ToasterModule, ToasterService } from 'angular2-toaster/angular2-toaster';
import { MomentModule } from 'angular2-moment';
import { AuthGuard } from '../_guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    InitialBalanceImportRoutingModule,
    AccordionModule.forRoot(),
    HttpModule,
    DataTableModule,
    ToasterModule,
    MomentModule,
    NumberFormatModule,
    ToXLSColumnNameModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [InitialBalanceImportService, ToasterService, AuthGuard],
  declarations: [
    InitialBalanceImportComponent,
    InitialBalanceImportLogComponent,
    InitialBalanceGenerateXLSXComponent
  ]
})
export class InitialBalanceImportModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
