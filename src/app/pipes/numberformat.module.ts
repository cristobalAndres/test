import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberFormatPipe } from './numberformat.pipe';

@NgModule({
  imports: [CommonModule],
  exports: [NumberFormatPipe],
  declarations: [NumberFormatPipe]
})
export class NumberFormatModule {
}
