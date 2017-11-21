import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingComponent } from './setting.component';
import { InterestFineComponent } from './interest-fine/interest-fine.component';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: SettingComponent,
  canActivate: [AuthGuard],
  data: {
    title: 'SETTINGS.GENERAL.PLURAL'
  },
  children: [
    {
      path: '',
      component: InterestFineComponent,
      canActivate: [AuthGuard],
      data: {
        title: ''
      }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule {
}
