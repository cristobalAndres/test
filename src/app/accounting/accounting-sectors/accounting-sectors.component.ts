import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'app-accounting-sectors',
  templateUrl: './accounting-sector.html'
})
export class AccountingSectorsComponent implements OnInit {
  @Input('accountingForm') accountingForm: FormGroup;
  @Input('accountingId') accountingId: number;
  @Output() sector = new EventEmitter();
  accountId: number;
  public communityId: number;
  public active: Boolean;
  public isDisabled: boolean = false;
  constructor(private _fb: FormBuilder) { }

  ngOnInit() {
    this.active = this.accountingForm.value.active;
    this.communityId = +localStorage.getItem('communityId');
  }

  outputFormSector(estadoForm): void {
    this.isDisabled = true;
    this.sector.emit({
      estadoForm,
      account_id: this.accountingId
    })
  }
}
