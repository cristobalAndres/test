import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';

import { CommunityRoutingModule } from './community-routing.module';
import { CommunityComponent } from './community.component';
import { CommunityService } from '../services/community.service';

// Bootstrap Modules
import { DataTableModule } from 'angular2-datatable';
import { FormsModule } from '@angular/forms';
import { DataFilterModule } from '../pipes/datafilter.module';
import { AuthGuard } from '../_guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    CommunityRoutingModule,
    HttpModule,
    DataTableModule,
    FormsModule,
    DataFilterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [CommunityService, AuthGuard],
  declarations: [CommunityComponent]
})
export class CommunityModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
