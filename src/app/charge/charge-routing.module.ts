import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Services
import { AuthGuard } from '../_guards/auth.guard';

// Components
import { ChargeComponent } from './charge.component';

const routes: Routes = [
  {
    path: '',
    component: ChargeComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'CHARGE.GENERAL.PLURAL'
    },
    // children: [
    //   {
    //     path: '',
    //     component: ChargeComponent,
    //     canActivate: [AuthGuard],
    //     data: {
    //       title: 'CHARGE.GENERAL.PLURAL'
    //     }
    //   }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChargeRoutingModule {
}
