import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommunityUnitsComponent } from './community-units.component';
import { ListUnitsComponent } from './list/list-units.component';
import { AssignmentUnitsComponent } from './assignment-units/assignment-units.component';

import { AuthGuard } from '../_guards/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: CommunityUnitsComponent,
    canActivate: [ AuthGuard ],
    data: {
      title: 'COMMUNITY-UNITS.GENERAL.PLURAL'
    },
    children: [
      {
        path: 'list-units',
        component: ListUnitsComponent,
        canActivate: [AuthGuard],
        data: {
          title: ''
        }
      },
      {
        path: 'assignment-units',
        component: AssignmentUnitsComponent,
        canActivate: [AuthGuard],
        data: {
          title: ''
        }
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityUnitsRoutingModule { }
