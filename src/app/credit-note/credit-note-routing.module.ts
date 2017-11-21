import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { CreditNoteComponent } from './credit-note.component';
import { ListComponent } from './list/list.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: CreditNoteComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'CREDIT_NOTE.GENERAL.PLURAL'
    },
    children: [
      {
        path: '',
        component: ListComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'CREDIT_NOTE.GENERAL.PLURAL'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreditNoteRoutingModule {
}
