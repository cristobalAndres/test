import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentComponent } from './payment.component';
import { PaymentAdvanceComponent } from './payment-advance/payment-advance.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [
  {
    path: 'list',
    component: PaymentComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'PAYMENT.GENERAL.PLURAL',
    }
  },
  {
    path: 'advance',
    component: PaymentAdvanceComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'PAYMENT.GENERAL.PLURAL',
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule {
}
