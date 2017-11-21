import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { SectorComponent } from './sector.component';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: SectorComponent,
    canActivate: [AuthGuard],
    data: {
      title: ''
    },
    children: [
      {
        path: 'list',
        component: ListComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'SECTOR.GENERAL.PLURAL'
        }
      },
      {
        path: 'create',
        component: CreateComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'SECTOR.GENERAL.SINGULAR'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SectorRoutingModule {
}
