import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BankAccountComponent } from './bank-account.component';
import { CreateComponent } from './create/create.component'
const routes: Routes = [{
  path: 'list',
  component: BankAccountComponent,
  data: {
    title: 'BANK_ACCOUNT.GENERAL.PLURAL'
  }
},
{
  path: 'create',
  component: CreateComponent,
  data: {
    title: 'BANK_ACCOUNT.CREATE.SINGULAR',
  }
},
{
  path: 'edit/:id',
  component: CreateComponent,
  data: {
    title: 'BANK_ACCOUNT.EDIT.SINGULAR'
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BankAccountRoutingModule { }
