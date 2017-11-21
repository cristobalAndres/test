import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FundComponent } from './fund.component';
import { FundFormComponent } from './form/form.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'FUND.GENERAL.PLURAL'
    },
    children: [
      {
        path: 'list-funds',
        component: FundComponent,
        canActivate: [AuthGuard],
        data: {
          title: ''
        }
      },
      {
        path: 'create',
        component: FundFormComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'FUND.GENERAL.CREATE'
        }
      },
      {
        path: 'edit/:id',
        component: FundFormComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'FUND.GENERAL.DATA'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FundRoutingModule {
}
