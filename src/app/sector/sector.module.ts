import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { ToasterModule } from 'angular2-toaster';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';

// Routing
import { SectorRoutingModule } from './sector-routing';

// Services
import { AuthGuard } from '../_guards/auth.guard';
import { PropertyService } from '../services/property.service';
import { NumberFormatPipe } from '../pipes/numberformat.pipe';
import { SectorService } from '../services/sector.service';
import { DataFilterModule } from '../pipes/datafilter.module';
import { DataTableModule } from 'angular2-datatable';
import { HelperService } from '../services/helpers.service';

// Components
import { SectorComponent } from './sector.component';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    ToasterModule,
    SectorRoutingModule,
    ModalModule.forRoot(),
    DataFilterModule,
    DataTableModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [SectorComponent,
    ListComponent,
    CreateComponent],
  providers: [AuthGuard,
    PropertyService,
    SectorService,
    NumberFormatPipe,
    HelperService]
})
export class SectorModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
}
