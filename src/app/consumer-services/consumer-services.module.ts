import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { ToasterModule } from 'angular2-toaster';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { ModalModule } from 'ngx-bootstrap/modal';

// Services
import { SettingsService } from '../services/settings.service';
import { SectorService } from '../services/sector.service';
import { SuppliersService } from '../services/suppliers.service';
import { PeriodService } from '../services/period.service';
import { ConsumerServicesService } from '../services/consumer-services.service';
import { AccoutingAccountService } from '../services/accouting-account.service';
import { CommunityService } from '../services/community.service';
import { HelperService } from '../services/helpers.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';



// Router
import { ConsumerServicesRoutingModule } from './consumer-services-routing';

// Componets
import { ConsumerServicesComponent } from './consumer-services.component';
import { DistributionConsumptionComponent } from './distribution-consumption/distribution-consumption.component';
import { ConsumptionServicesComponent } from './consumption-services/consumption-services.component';
import { AssignExpensesToDistributionComponent } from './assign-expenses-to-distribution/assign-expenses-to-distribution.component';
import { RecordReadingComponent } from './record-reading/record-reading.component'


export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'right',
  allowNegative: false,
  allowZero: true,
  decimal: ',',
  precision: 0,
  prefix: '$ ',
  suffix: '',
  thousands: '.'
};


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    ToasterModule,
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
    ConsumerServicesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [ConsumerServicesComponent, DistributionConsumptionComponent, ConsumptionServicesComponent, AssignExpensesToDistributionComponent, RecordReadingComponent],
  providers: [
    SettingsService,
    SectorService,
    SuppliersService,
    PeriodService,
    ConsumerServicesService,
    AccoutingAccountService,
    CommunityService,
    HelperService,
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ]
})
export class ConsumerServicesModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
}
