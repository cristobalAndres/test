import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {BillComponent} from './bill.component';

const routes: Routes = [
  {
    path: '',
    component: BillComponent,
    data: {
      title: 'BILL.GENERAL.PLURAL'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillRoutingModule {

}
