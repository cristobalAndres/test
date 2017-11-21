import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountCodeMaskPipe } from './accountcodemask.pipe';

@NgModule({
  imports: [CommonModule],
  exports: [AccountCodeMaskPipe],
  declarations: [AccountCodeMaskPipe]
})
export class AccountCodeMaskModule {
}
