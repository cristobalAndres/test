import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

// Services
import { HelperService } from '../../../services/helpers.service';
import { SectorService } from '../../../services/sector.service';

@Component({
  selector: 'app-sector-dynamic',
  templateUrl: './sector.component.html',
})
export class SectorDynamicComponent implements OnInit {
  @Input('sectorForm')
  sectorForm: FormGroup;
  @Input('sectorName')
  sectorName: any;
  @Input('alert')
  alert: any;
  @Input('disabledSector') disabledSector: any;
  amount: number;
  @Output() ouputValueSector = new EventEmitter();
  subscriptionAlertSector: Subscription;

  constructor(public _helperService: HelperService,
    private _sectorService: SectorService) { }

  ngOnInit() {
    this.amount = this.sectorForm.value.amount;
    // oyente Alert Sector
    this.subscriptionAlertSector = this._sectorService.observableSectorAlert$
      .subscribe(
      alert => {
        this.alert = alert;
      });
  }

  // detectamos cambios en valor de sector y notificamos para evaluación
  changeAmount() {
    this.ouputValueSector.emit({
      amount: this.amount
    });
  }
}
