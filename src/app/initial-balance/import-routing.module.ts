import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InitialBalanceImportComponent } from './import.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'COMMUNITY.IMPORT.IMPORT_TEXT'
    },
    children: [
      {
        path: '',
        component: InitialBalanceImportComponent,
        canActivate: [AuthGuard],
        data: {
          title: ''
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InitialBalanceImportRoutingModule {
}
