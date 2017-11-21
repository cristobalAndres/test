import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankAccountComponent } from './bank-account.component';
import { BankAccountRoutingModule } from './bank-account-routing.module';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { BankAccountService } from '../services/bank.service';
import { ToasterModule, ToasterService } from 'angular2-toaster/angular2-toaster';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountCodeMaskModule } from '../pipes/accountcodemask.module';
import { DataFilterModule } from '../pipes/datafilter.module';
import { DataTableModule } from 'angular2-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CreateComponent } from './create/create.component'
import { AuthGuard } from '../_guards/auth.guard';

import { BsDatepickerModule } from 'ngx-bootstrap';
import { MomentModule } from 'angular2-moment';
import { CurrencyMaskModule } from 'ng2-currency-mask';


@NgModule({
  imports: [
    CommonModule,
    BankAccountRoutingModule,
    ToasterModule,
    NumberFormatModule,
    AccountCodeMaskModule,
    FormsModule,
    DataFilterModule,
    DataTableModule,
    ReactiveFormsModule,
    BsDatepickerModule,
    MomentModule,
    CurrencyMaskModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  declarations: [BankAccountComponent, CreateComponent],
  providers: [BankAccountService, ToasterService, AuthGuard]
  
})
export class BankAccountModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
}
