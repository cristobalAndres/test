import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction.component';
import { TransactionRoutingModule } from './transaction-routing.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AppTranslate, HttpLoaderFactory } from '../app.translate';
import { HttpModule, Http } from '@angular/http';
import { TransactionService } from './transaction.service';
import { NumberFormatModule } from '../pipes/numberformat.module';
import { DataFilterModule } from '../pipes/datafilter.module';
import { AccountCodeMaskModule } from '../pipes/accountcodemask.module';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../_guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    TransactionRoutingModule,
    NumberFormatModule,
    DataFilterModule,
    AccountCodeMaskModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [TransactionService, AuthGuard],
  declarations: [TransactionComponent]
})
export class TransactionModule extends AppTranslate {
  constructor(translate: TranslateService) {
    super(translate);
  }
 }
