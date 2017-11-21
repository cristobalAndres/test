import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommunityImportRoutingModule } from './import-routing.module';
import { CommunityImportComponent } from './import.component';

import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { ToXLSColumnNameModule } from '../pipes/toxlscolumnname.module';

import { CommunityImportService } from './import.service';
import { CommunityImportLogComponent } from './log/log.component';

import { DataTableModule } from 'angular2-datatable';
import { AccordionModule } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';


import { ToasterModule, ToasterService } from 'angular2-toaster/angular2-toaster';
import { MomentModule } from 'angular2-moment';
import { AuthGuard } from '../_guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    CommunityImportRoutingModule,
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
  providers: [CommunityImportService, ToasterService, AuthGuard],
  declarations: [CommunityImportComponent, CommunityImportLogComponent]
})
export class CommunityImportModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
