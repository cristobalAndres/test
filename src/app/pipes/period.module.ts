import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodPipe } from './period.pipe';

@NgModule({
  imports: [CommonModule],
  exports: [PeriodPipe],
  declarations: [PeriodPipe]
})
export class PeriodModule {
}
