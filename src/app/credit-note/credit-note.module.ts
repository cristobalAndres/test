import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataFilterModule } from '../pipes/datafilter.module';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { ToasterModule } from 'angular2-toaster';

// Router
import { CreditNoteRoutingModule } from './credit-note-routing.module';

// Services
import { SettingsService } from '../services/settings.service';
import { PeriodService } from '../services/period.service';
import { DebtTypeService } from '../services/debt-type.service';
import { BillService } from '../services/bill.service';
import { HelperService } from '../services/helpers.service';
import { FundService } from '../fund/fund.service';

// Components
import { CreditNoteComponent } from './credit-note.component';
import { ListComponent } from './list/list.component';
import { AuthGuard } from '../_guards/auth.guard';


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    CreditNoteRoutingModule,
    DataFilterModule,
    NumberFormatModule,
    ToasterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  declarations: [CreditNoteComponent, ListComponent],
  providers: [
    SettingsService,
    PeriodService,
    DebtTypeService,
    BillService,
    HelperService,
    FundService, AuthGuard
  ]
})
export class CreditNoteModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
