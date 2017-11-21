import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToasterModule } from 'angular2-toaster';
import { AccountCodeMaskModule } from '../pipes/accountcodemask.module';
import { ModalModule } from 'ngx-bootstrap/modal';

// Component
import { AccountingComponent } from './accounting.component';
import { ExpenseAccountingAccountComponent } from './expense-accounting-account/expense-accounting-account.component';
import { ExpenseAccountingAccountChildrenComponent } from './expense-accounting-account-children/expense-accounting-account-children.component';
import { AccountingSectorsComponent } from './accounting-sectors/accounting-sectors.component';
import { AccountingFatherComponent } from './accounting-father/accounting-father.component';
// Router
import { AccountingAccountRoutingModule } from './accounting-routing.module';

// Services
import { AccoutingAccountService } from '../services/accouting-account.service';
import { SectorService } from '../services/sector.service';
import { AuthGuard } from '../_guards/auth.guard';
import { HelperService } from '../services/helpers.service';

@NgModule({
  imports: [
    CommonModule,
    AccountingAccountRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    ToasterModule,
    AccountCodeMaskModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  declarations: [AccountingComponent, ExpenseAccountingAccountComponent, ExpenseAccountingAccountChildrenComponent, AccountingSectorsComponent, AccountingFatherComponent],
  providers: [AccoutingAccountService, SectorService, AuthGuard, HelperService]
})
export class AccountingAccountModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
