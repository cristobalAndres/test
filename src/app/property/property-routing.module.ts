import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PropertyComponent } from './property.component';
import { AuthGuard } from '../_guards/auth.guard';
import {ListComponent} from './list/list.component';

const routes: Routes = [
  {
    path: '',
    component: PropertyComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'PROPERTY.GENERAL.PLURAL'
    },
    children: [
      {
        path: 'list-property',
        component: ListComponent,
        canActivate: [AuthGuard],
        data: {
          title: ''
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyRoutingModule {
}
