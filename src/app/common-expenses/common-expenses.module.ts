import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonExpensesComponent } from './common-expenses.component';
import { CommonExpensesRoutingModule } from './common-expense-routing.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { ToasterModule } from 'angular2-toaster/angular2-toaster';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { HttpModule, Http } from '@angular/http';
import { CommonExpensesService } from './common-expenses.service';
import { SectorService } from '../services/sector.service';
import { HelperService } from '../services/helpers.service';
import { SettingsService } from '../services/settings.service';
import { PeriodService } from '../services/period.service';
import { FundService } from '../fund/fund.service';
import { InterestFinesService  } from '../services/interest-fines.service'
import { BsDatepickerModule } from 'ngx-bootstrap';
import { MomentModule } from 'angular2-moment';


import { DataFilterModule } from '../pipes/datafilter.module';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from '../_guards/auth.guard';
import { ModalModule } from 'ngx-bootstrap';
import { AccoutingAccountService } from '../services/accouting-account.service';

@NgModule({
  imports: [
    CommonModule,
    ToasterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonExpensesRoutingModule,
    BsDatepickerModule,
    DataFilterModule,
    NumberFormatModule,
    MomentModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  declarations: [
    CommonExpensesComponent
  ],
  providers: [CommonExpensesService,
    InterestFinesService,
    SectorService,
    HelperService,
    SettingsService,
    PeriodService,
    FundService, AuthGuard,
    AccoutingAccountService]
})
export class CommonExpensesModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
}
