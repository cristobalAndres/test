import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransactionComponent } from './transaction.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: TransactionComponent,
  canActivate: [AuthGuard],
  data: {
    title: 'TRANSACTION.GENERAL.PLURAL'
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionRoutingModule {
}
