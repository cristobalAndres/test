import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmControlComponent } from './confirm-control.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  imports: [CommonModule, ModalModule],
  exports: [ConfirmControlComponent],
  declarations: [ConfirmControlComponent]
})
export class ConfirmControlModule {
}
