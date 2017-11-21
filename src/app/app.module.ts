import * as Raven from 'raven-js';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpModule } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from './app.translate';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule } from 'angular2-toaster';

import { AppComponent } from './app.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NAV_DROPDOWN_DIRECTIVES } from './shared/nav-dropdown.directive';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { SIDEBAR_TOGGLE_DIRECTIVES } from './shared/sidebar.directive';
import { AsideToggleDirective } from './shared/aside.directive';
import { BreadcrumbsComponent } from './shared/breadcrumb.component';
import { FormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation'
import { UploadControlService } from './controls/upload-control/upload-control.service'
import { BsDatepickerModule } from 'ngx-bootstrap';

// Routing Module
import { AppRoutingModule } from './app.routing';

// Layouts
import { FullLayoutComponent } from './layouts/full-layout.component';
import { GoogleAnalyticsEventsService } from './google-analytics-events.service';

import { MomentModule } from 'angular2-moment';
import { AuthenticationService } from './services/authentication.service';
import { BlankLayoutComponent } from './layouts/blank-layout.component';

// Raven
//   .config('https://6e2be0f3889d4c9887a609d45ccd2e7b@sentry.io/174506')
//   .install();

// export class RavenErrorHandler implements ErrorHandler {
//   handleError(err: any): void {
//     Raven.captureException(err.originalError);
//   }
// }

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    CustomFormsModule,
    BrowserAnimationsModule,
    ToasterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    AppRoutingModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    BsDatepickerModule.forRoot(),
    MomentModule,
  ],
  declarations: [
    AppComponent,
    FullLayoutComponent,
    BlankLayoutComponent,
    NAV_DROPDOWN_DIRECTIVES,
    BreadcrumbsComponent,
    SIDEBAR_TOGGLE_DIRECTIVES,
    AsideToggleDirective
  ],
  providers: [
    UploadControlService,
    GoogleAnalyticsEventsService,
    AuthenticationService,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
