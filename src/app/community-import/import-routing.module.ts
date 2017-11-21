import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommunityImportComponent } from './import.component';
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
        component: CommunityImportComponent,
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
export class CommunityImportRoutingModule {
}
