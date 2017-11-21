import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';

import { CommunityUnitsRoutingModule } from './community-units-routing.module';
import { CommunityUnitsComponent } from './community-units.component';
import { ListUnitsComponent } from './list/list-units.component';
import { AssignmentUnitsComponent } from './assignment-units/assignment-units.component';
import { AuthGuard } from '../_guards/auth.guard';
import { DataTableModule } from 'angular2-datatable';
import { DataFilterModule } from '../pipes/datafilter.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToasterModule } from 'angular2-toaster';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { DragDropDirectiveModule} from 'angular4-drag-drop';

// services
import { CommunityService } from '../services/community.service';
import { PropertyService } from '../services/property.service';
import { HelperService } from '../services/helpers.service';

@NgModule({
  imports: [
    CommonModule,
    CommunityUnitsRoutingModule,
    DataFilterModule,
    HttpModule,
    DataTableModule,
    FormsModule,
    ReactiveFormsModule,
    ToasterModule,
    DragDropDirectiveModule,
    NumberFormatModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [ AuthGuard, CommunityService, PropertyService, HelperService],
  declarations: [CommunityUnitsComponent, ListUnitsComponent, AssignmentUnitsComponent]
})
export class CommunityUnitsModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
}
