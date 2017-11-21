import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';

import { BankComponent } from './bank.component';
import { BankRoutingModule } from './bank-routing.module';
import { BankService } from './bank.service';

import { DataTableModule } from 'angular2-datatable';
import { FormsModule } from '@angular/forms';
import { DataFilterModule } from '../pipes/datafilter.module';
import { AuthGuard } from '../_guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    BankRoutingModule,
    HttpModule,
    DataTableModule,
    FormsModule,
    DataFilterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [BankService, AuthGuard],
  declarations: [BankComponent]
})
export class BankModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
