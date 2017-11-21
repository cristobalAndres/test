import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { ExpenseComponent } from './expense.component';
import { ExpenseRoutingModule } from './expense-routing.module';
import { ToasterModule } from 'angular2-toaster';
import { ModalModule } from 'ngx-bootstrap/modal';


import { ExpenseService } from './expense.service';
import { HelperService } from '../services/helpers.service';
import { SuppliersService } from '../services/suppliers.service';
import { SectorService } from '../services/sector.service';
import { ExpensesTypesService } from '../services/expense-types.service';
import { AccoutingAccountService } from '../services/accouting-account.service';
import { PeriodService } from '../services/period.service';
import { FundService } from '../fund/fund.service';
import { SettingsService } from '../services/settings.service';
import { AssignmentsTypeService } from '../services/assignment-type.service';
import { PropertyService } from '../services/property.service';
import { SurchargeService } from '../surcharge/surcharge.service';
import { MethodsCalculateService } from '../services/method-calculate.service';

// Components
import { ExpenseDynamicComponent } from '../shared/components/expanse-dynamic/expanse-dynamic.component';
import { FeeDynamicComponent } from '../shared/components/fee-dynamic/fee.component';
import { SectorDynamicComponent } from '../shared/components/sector-dynamic/sector.component';
import { ExpanseAssignComponent } from '../shared/components/expense-assign-dynamic/expense-assign.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { DataFilterModule } from '../pipes/datafilter.module';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { PeriodModule } from '../pipes/period.module';
import { AssignComponent } from './assign/assign.component';
import { NewComponent } from './new/new.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { AssignPropertyComponent } from './assign-property/assign-property.component';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { MomentModule } from 'angular2-moment';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { AuthGuard } from '../_guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    ExpenseRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    ToasterModule,
    DataTableModule,
    DataFilterModule,
    CurrencyMaskModule,
    NumberFormatModule,
    PeriodModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    BsDatepickerModule,
    MomentModule
  ],
  providers: [ExpenseService,
    HelperService,
    SuppliersService,
    SectorService,
    ExpensesTypesService,
    AccoutingAccountService,
    PeriodService,
    FundService,
    SettingsService,
    AssignmentsTypeService,
    PropertyService,
    SurchargeService,
    MethodsCalculateService,
    ExpenseDynamicComponent,
    FeeDynamicComponent,
    SectorDynamicComponent,
    ExpanseAssignComponent, AuthGuard],
  declarations: [ExpenseComponent,
    ExpenseDynamicComponent,
    FeeDynamicComponent,
    SectorDynamicComponent,
    ExpanseAssignComponent,
    AssignComponent,
    NewComponent,
    ListComponent,
    EditComponent,
    AssignPropertyComponent],
  exports: [ExpenseDynamicComponent,
    FeeDynamicComponent,
    SectorDynamicComponent,
    ExpanseAssignComponent]
})
export class ExpenseModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
