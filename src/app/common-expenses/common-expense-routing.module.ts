import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonExpensesComponent } from './common-expenses.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: CommonExpensesComponent,
  canActivate: [AuthGuard],
  data: {
    title: 'COMMON_EXPENSE.GENERAL.PLURAL'
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonExpensesRoutingModule {

}
