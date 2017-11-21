import { AccordionModule, ModalModule } from 'ngx-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../../app.translate';

import { BillRoutingModule } from './bill-routing.module';
import { BillComponent } from './bill.component';

import { BillService } from '../../services/bill.service';
import { PaymentService } from '../../services/payment.service';
import { WalletService } from '../../services/wallet.service';
import { BankService } from '../../bank/bank.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';

// Bootstrap Modules
import { DataTableModule } from 'angular2-datatable';
import { FormsModule } from '@angular/forms';
import { DataFilterModule } from '../../pipes/datafilter.module';
import { NumberFormatModule } from '../../pipes/numberformat.module';
import { ToasterModule, ToasterService } from 'angular2-toaster/angular2-toaster';
import { BankAccountService } from '../../services/bank.service';
import { PropertyService } from '../../services/property.service';

import { BsDatepickerModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    BillRoutingModule,
    AccordionModule.forRoot(),
    NumberFormatModule,
    HttpModule,
    DataTableModule,
    FormsModule,
    ToasterModule,
    DataFilterModule,
    CurrencyMaskModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    BsDatepickerModule
  ],
  providers: [BillService, WalletService, BankService, BankAccountService, PaymentService, PropertyService, ToasterService],
  declarations: [BillComponent]
})
export class BillModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
