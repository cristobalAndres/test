import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingComponent } from './setting.component';
import { InterestFineComponent } from './interest-fine/interest-fine.component';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToasterModule } from 'angular2-toaster';
import { DataTableModule } from 'angular2-datatable';
import { NumberFormatModule } from '../pipes/numberformat.module';

// Services
import { InterestFineService } from './interest-fine/interest-fine.service';
import { AssignmentsTypeService } from '../services/assignment-type.service';
import { FundService } from '../fund/fund.service';
import { DebtTypeService } from '../services/debt-type.service';

// Router
import { SettingRoutingModule } from './setting-routing.module';
import { InterestFineLogsComponent } from './interest-fine/interest-fine-logs/interest-fine-logs.component';
import { MomentModule } from 'angular2-moment';
import { AuthGuard } from '../_guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    SettingRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    ToasterModule,
    DataTableModule,
    NumberFormatModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    MomentModule
  ],
  declarations: [SettingComponent, InterestFineComponent, InterestFineLogsComponent],
  providers: [InterestFineService,
    FundService,
    AssignmentsTypeService,
    DebtTypeService, AuthGuard]
})
export class SettingModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
}
