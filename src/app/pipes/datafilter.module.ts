import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataFilterPipe } from './datafilter.pipe';

@NgModule({
  imports: [CommonModule],
  exports: [DataFilterPipe],
  declarations: [DataFilterPipe]
})
export class DataFilterModule {
}
