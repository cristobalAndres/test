import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialStateComponent } from './financial-state.component';
import { FinancialStateRoutingModule } from './financial-state-routing.module';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { FinancialStateService } from './financial-state.service';
import { ToasterModule, ToasterService } from 'angular2-toaster/angular2-toaster';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from '../_guards/auth.guard';
import { AccountCodeMaskModule } from '../pipes/accountcodemask.module';

@NgModule({
  imports: [
    CommonModule,
    FinancialStateRoutingModule,
    ToasterModule,
    NumberFormatModule,
    AccountCodeMaskModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  declarations: [FinancialStateComponent],
  providers: [FinancialStateService, ToasterService, AuthGuard]
})
export class FinancialStateModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
}
