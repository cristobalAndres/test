import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpenseComponent } from './expense.component';
import { NewComponent } from './new/new.component';
import { AssignComponent } from './assign/assign.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { AssignPropertyComponent } from './assign-property/assign-property.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: ExpenseComponent,
  canActivate: [AuthGuard],
  data: {
    title: 'EXPENSE.GENERAL.PLURAL'
  },
  children: [
    {
      path: 'list-expense',
      component: ListComponent,
      canActivate: [AuthGuard],
      data: {
        title: ''
      }
    },
    {
      path: 'create',
      component: NewComponent,
      canActivate: [AuthGuard],
      data: {
        title: 'EXPENSE.GENERAL.NEW.PLURAL'
      }
    },
    {
      path: 'assign',
      component: AssignComponent,
      canActivate: [AuthGuard],
      data: {
        title: 'EXPENSE.GENERAL.ASSIGN'
      }
    },
    {
      path: 'edit/:id',
      component: EditComponent,
      canActivate: [AuthGuard],
      data: {
        title: 'EXPENSE.GENERAL.EDIT'
      }
    },
    {
      path: 'assign-property',
      component: AssignPropertyComponent,
      canActivate: [AuthGuard],
      data: {
        title: 'EXPENSE.GENERAL.ASSIGN_PROPERTY'
      }
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpenseRoutingModule {
}
