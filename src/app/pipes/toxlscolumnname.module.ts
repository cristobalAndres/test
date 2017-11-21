import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToXLSColumnNamePipe } from './toxlscolumnname.pipe';

@NgModule({
  imports: [CommonModule],
  exports: [ToXLSColumnNamePipe],
  declarations: [ToXLSColumnNamePipe]
})
export class ToXLSColumnNameModule {
}
