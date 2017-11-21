import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToasterModule } from 'angular2-toaster/angular2-toaster';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentComponent } from './payment.component';
import { PaymentService } from '../services/payment.service';
import { ConfirmControlModule } from '../controls/confirm-control/confirm-control.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';

// Bootstrap Modules
import { DataTableModule } from 'angular2-datatable';
import { DataFilterModule } from '../pipes/datafilter.module';
import { ModalModule } from 'ngx-bootstrap';
import { PropertyService } from '../services/property.service';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { PaymentAdvanceComponent } from './payment-advance/payment-advance.component';

import { BsDatepickerModule } from 'ngx-bootstrap';
import { AuthGuard } from '../_guards/auth.guard';
import { TooltipModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    PaymentRoutingModule,
    HttpModule,
    DataTableModule,
    FormsModule,
    ToasterModule,
    DataFilterModule,
    ConfirmControlModule,
    CurrencyMaskModule,
    NumberFormatModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    BsDatepickerModule,
    TooltipModule.forRoot()
  ],
  providers: [PaymentService, PropertyService, AuthGuard],
  declarations: [PaymentComponent, PaymentAdvanceComponent]
})
export class PaymentModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
