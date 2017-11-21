import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './login/login.component';
import { GuardsRoutingModule } from './guards-routing.module';
import { AuthenticationService } from '../services/authentication.service';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { ResetComponent } from './reset/reset.component';
import { RestoreComponent } from './restore/restore.component';
import { LogoutComponent } from './logout/logout.component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    GuardsRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [AuthenticationService],
  declarations: [LoginComponent, ResetComponent, RestoreComponent, LogoutComponent]
})
export class GuardsModule extends AppTranslate {

  constructor(translate: TranslateService) {
    super(translate);
  }
}
