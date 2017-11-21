import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { AuthGuard } from '../_guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule
  ],
  providers: [AuthGuard],
  declarations: [DashboardComponent]
})
export class DashboardModule {
}
