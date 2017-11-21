import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { PropertyRoutingModule } from './property-routing.module';
import { PropertyComponent } from './property.component';
import { PropertyService } from '../services/property.service';
import { CommunityService } from '../services/community.service';

import { SectorService } from '../services/sector.service';

import {HelperService} from '../services/helpers.service';
// Bootstrap Modules
import { DataTableModule } from 'angular2-datatable';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DataFilterModule } from '../pipes/datafilter.module';
import { ModalModule } from 'ngx-bootstrap/modal';
// import { DragDropDirectiveModule} from 'angular4-drag-drop';

import { ToasterModule, ToasterService } from 'angular2-toaster/angular2-toaster';
import { AuthGuard } from '../_guards/auth.guard';
import { ListComponent } from './list/list.component';
// import { AssignmentUnitsComponent } from './assignment-units/assignment-units.component';

@NgModule({
  imports: [
    CommonModule,
    PropertyRoutingModule,
    NumberFormatModule,
    HttpModule,
    DataTableModule,
    FormsModule,
    ReactiveFormsModule,
    DataFilterModule,
    ToasterModule,
    // DragDropDirectiveModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [PropertyService, ToasterService, AuthGuard, HelperService, CommunityService],
  declarations: [PropertyComponent, ListComponent/*, AssignmentUnitsComponent*/]
})
export class PropertyModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
}
