import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SurchargeCategoryComponent } from './category/surcharge-category.component';
import { SurchargeImportComponent } from './import/surcharge-import.component';
import { SurchargeListComponent } from './list/surcharge-list.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [
  {
    path: 'list',
    component: SurchargeListComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'SURCHARGE.GENERAL.PLURAL'
    }
  },
  {
    path: 'category',
    component: SurchargeCategoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'import',
    component: SurchargeImportComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurchargeRoutingModule {
}
