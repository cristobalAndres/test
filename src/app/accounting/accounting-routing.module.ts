import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountingComponent } from './accounting.component';
import { ExpenseAccountingAccountComponent } from './expense-accounting-account/expense-accounting-account.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: AccountingComponent,
  canActivate: [ AuthGuard ],
  data: {
    title: 'ACCOUNTING_ACCOUNTS.GENERAL.PLURAL'
  },
  children: [
    {
      path: '',
      component: ExpenseAccountingAccountComponent,
      canActivate: [ AuthGuard ],
      data: {
        title: ''
      }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingAccountRoutingModule {
}
