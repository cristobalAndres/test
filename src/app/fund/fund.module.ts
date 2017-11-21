import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { FundRoutingModule } from './fund-routing.module';
import { FundService } from './fund.service';
import { AccoutingAccountService } from '..//services/accouting-account.service';
import { HttpModule, Http } from '@angular/http';
import { ToasterModule, ToasterService } from 'angular2-toaster/angular2-toaster';
import { DataTableModule } from 'angular2-datatable';
import { DataFilterModule } from '../pipes/datafilter.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FundComponent } from './fund.component';
import { FundFormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { MomentModule } from 'angular2-moment';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { AuthGuard } from '../_guards/auth.guard';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@NgModule({
  imports: [
    CommonModule,
    FundRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ToasterModule,
    CurrencyMaskModule,
    DataTableModule,
    DataFilterModule,
    NumberFormatModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    BsDatepickerModule.forRoot(),
    MomentModule
  ],
  declarations: [FundComponent, FundFormComponent, ListComponent],
  providers: [FundService, AccoutingAccountService, ToasterService, AuthGuard]
})
export class FundModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
