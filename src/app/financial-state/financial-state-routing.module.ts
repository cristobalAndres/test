import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinancialStateComponent } from './financial-state.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: FinancialStateComponent,
  canActivate: [ AuthGuard ],
  data: {
    title: 'FINANCIAL_STATE.GENERAL.PLURAL'
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancialStateRoutingModule { }
