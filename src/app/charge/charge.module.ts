import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToasterModule } from 'angular2-toaster';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { DataFilterModule } from '../pipes/datafilter.module';

// Services
import { AuthGuard } from '../_guards/auth.guard';
import { SettingsService } from '../services/settings.service';
import { PeriodService } from '../services/period.service';
import { PropertyService } from '../services/property.service';
import { ReportService } from '../services/report.service';
import { SectorService } from '../services/sector.service';

// Router
import { ChargeRoutingModule } from './charge-routing.module';

// Components
import { ChargeComponent } from './charge.component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    DataFilterModule,
    ToasterModule,
    ChargeRoutingModule,
    NumberFormatModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  declarations: [ChargeComponent],
  providers: [
    AuthGuard,
    SettingsService,
    PeriodService,
    PropertyService,
    ReportService,
    SectorService
  ]
})
export class ChargeModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
