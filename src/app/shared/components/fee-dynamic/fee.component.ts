import { Component, Input, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

// Services
import { HelperService } from '../../../services/helpers.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';

// Models
import { Period } from '../../../models/period.model';
import { Sector } from '../../../models/sector.model';

@Component({
  selector: 'app-fee-dynamic',
  templateUrl: './fee.component.html',
})
export class FeeDynamicComponent implements OnInit, OnDestroy {
  @Input('periodCurrentSetting') periodCurrentSetting: string;
  @Input('feeForm') feeForm: FormGroup;
  @Input('expensesForm') expensesForm: FormGroup;
  @Input('feeIndex') feeIndex: number;
  @Input('count') count: number;
  @Input('form') form: FormGroup;
  @Input('amountExpense') amountExpense: number;
  @Input('amountFee') amountFee: number;
  @Input('alert') alert: any;
  @Input('alertSector') alertSector: any;
  @Input('sectors') sectors: Sector[];
  @Input('periods') periods: Period[];
  @Input('edit') edit: Boolean;
  @Output() ouputValueFee = new EventEmitter();
  @Output() ouputStateForm = new EventEmitter();
  @Output() ouputStateFormFees = new EventEmitter();
  @Output() ouputPeriod = new EventEmitter();
  componentDestroyed: Subject<boolean> = new Subject();
  amount: number;
  sectorName: string;
  id: number;
  amountFeeUnit: number;
  notificationAlert: Boolean = false;
  feePosition: number;
  description: string = '';
  lastSectorAmount: number;
  amountSector: number;
  widthCustomSector: string;
  public toasterconfig: ToasterConfig =
  new ToasterConfig({
    newestOnTop: false,
    positionClass: 'toast-bottom-right',
    preventDuplicates: false,
    tapToDismiss: true
  });

  constructor(
    private _fb: FormBuilder,
    public _helperService: HelperService,
    private _toasterService: ToasterService,
    private _translateService: TranslateService) {
    this._toasterService = _toasterService;
  }

  ngOnInit() {
    this.amount = this.feeForm.controls['amount'].value;
    this.initView();
    this.feePosition = (this.feeIndex + 1);
    if ((this.edit === undefined || false) || (this.feeForm.controls['description'].value.length === 0)) {
      this.feeForm.controls['description'].setValue(`Cuota ${this.feePosition} / ${this.count}`);
    }

    if (this.periods && (!this.edit || (this.feeForm.controls['period'].value === ''))) {
      let periods = [];
      if (this.periodCurrentSetting) {
        periods = this.periods.filter(p => p.period >= (+this.periodCurrentSetting));
      } else {
        periods = this.periods;
      }

      this.feeForm.controls['period'].setValue(periods[this.feeIndex].period);
    }

    if (this.feeForm.value.porcent) {
      this.changePorcent();
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  // inicializamos vista
  initView() {
    const widthContentSectors = document.getElementById('content_sectors').offsetWidth;
    this.widthCustomSector = ((widthContentSectors / this.sectors.length) - 3).toString();
    this.calculateValueFee();
    if ((this.edit === undefined || false) || (this.feeForm.controls['description'].value.length === 0)) {
      this.renderComponentSector();
    }
    this.changePeriod();
  }

  // inicializacion object dinamico
  initSectors(sector: any, feeId?: number) {
    if (this.edit) {
      return this._fb.group({
        id: feeId ? sector.id : null,
        sector_id: feeId ? sector.sector_id : sector.id,
        name: sector.name,
        active: sector.active,
        slug: sector.slug,
        amount: this.amountSector
      });
    } else {
      return this._fb.group({
        sector_id: sector.id,
        name: sector.name,
        active: sector.active,
        slug: sector.slug,
        amount: this.amountSector
      });
    }
  }

  // añadir objeto dinamico al formulario
  addSector(sector: Sector) {
    const control = <FormArray>this.feeForm.controls['expense_fee_sectors'];
    const addrCtrl = this.initSectors(sector, this.feeForm.controls['id'] ? this.feeForm.controls['id'].value : null);
    control.push(addrCtrl);
    this.ouputStateFormFees.emit(true);
  }

  // se encarga de renderizar componente SECTOR la cantidad de veces que corresponda según vista
  renderComponentSector() {
    for (let _i = 0; _i < this.sectors.length; _i++) {
      if (_i === 0) {
        this.amountSector = this.amount;
      } else {
        this.amountSector = 0;
      }
      this.addSector(this.sectors[_i]);
    }
  }

  renderComponentSectorEdit(sectors: any) {
    for (let _i = 0; _i < sectors.length; _i++) {
      if (_i === 0) {
        this.amountSector = this.amount;
      } else {
        this.amountSector = 0;
      }
      this.addSector(sectors[_i]);
    }
  }

  // eliminamos elementos de lista dinamica de objetos
  removeAllFees(feeForm: any) {
    const countSectors = feeForm.expense_fee_sectors.length;
    if (countSectors !== 0) {
      const promise = new Promise((resolve, reject) => {
        for (let _i = countSectors; _i >= 0; _i--) {
          this.removeFee(_i);
        }
      });
      return promise;
    }
  }

  // elimina elemento indicado
  removeFee(i: number) {
    const ctrl = <FormArray>this.feeForm.controls['expense_fee_sectors'];
    ctrl.removeAt(i);
  }

  // calculamos el valor por cuota según monto ingresado
  calculateValueFee() {
    if (this.amount !== undefined) {
      const promise = new Promise((resolve, reject) => {
        const amount = this.amount;
        const sectors = this.sectors.length;
        if (sectors > 0) {
          const sector = (amount / sectors);
          this.amountSector = Math.round((amount / sectors));
          this.lastSectorAmount = (this.amount - (this.amountSector * (sectors - 1)));
        }
      });

      return promise;
    }
  }

  // se calcula el monto en pesos según porcentaje ingresado
  changePorcent() {
    this.amount = Math.round((this.amountExpense * (+this.feeForm.controls['porcent'].value)) / 100);
    this.feeForm.controls['porcent'].setValue(((this.amount / this.amountExpense) * 100));
    this.feeForm.value.amount = this.amount;
    this.ouputStateForm.emit({
      estadoForm: this.notificationAlert
    });
    this.ouputValueFee.emit({
      amount: this.amount
    });
    this.calculateValueFee();
  }

  // evaluamos periodo seleccionado
  changePeriod() {
    const period = this.feeForm.controls['period'].value;
    const fees = this.form.controls['expense_fees'].value;
    const feeId = this.feeIndex;
    const count = fees.reduce((n, val) => {
      return n + (val.period === period && val.period !== '' && period !== '');
    }, 0);
    if (count > 1) {
      const DELETE_ERROR_MESSAGE = 'EXPENSE.FEE.DUPLICATE_PERIOD_MESSAGE';
      this._translateService.get(['EXPENSE.FEE.DUPLICATE_PERIOD_TITLE', DELETE_ERROR_MESSAGE])
        .subscribe((res: string) => {
          this._toasterService.pop('warning', res['EXPENSE.FEE.DUPLICATE_PERIOD_TITLE'], res[DELETE_ERROR_MESSAGE]);
          this.ouputPeriod.emit(true);
        });
    } else {
      this.ouputPeriod.emit(false);
    }
  }

  // se calcula el porcentaje, según monto ingresado
  changeMoney() {

    console.log('amount : ', this.amount);
    console.log('amountExpense', this.amountExpense);

    this.feeForm.controls['porcent'].setValue(((this.amount / this.amountExpense) * 100));
    this.changePorcent();
    this.calculateValueFee();
    const sectors = this.feeForm.controls['expense_fee_sectors'].value;
    this.removeAllFees(this.feeForm.value);
    if (this.edit) {
      this.renderComponentSectorEdit(sectors);
    } else {
      this.renderComponentSector();
    }
  }

  // evaluamos que montos de sectores no sea mayor avalor de cuota
  ouputValueSector(ouput: number) {
    const feeForm = this.feeForm.value;
    const sectors = this.feeForm.controls['expense_fee_sectors'].value;
    this.validateAmountFeeInSectors(feeForm.amount, sectors);
  }

  // validamos que los valores de los sectores no sean superiores al de la cuota
  validateAmountFeeInSectors(amountFee: number, amountSectors: any) {
    const amoutFee = amountFee;
    let amountSectorsValue = 0;
    // evaluamos los valores
    amountSectors.forEach(element => {
      if (element.amount !== undefined) {
        amountSectorsValue = amountSectorsValue + element.amount;
      }
    });
    if (amountSectorsValue > amoutFee) {
      this.notificationAlert = true;
      this.ouputStateForm.emit({
        estadoForm: this.notificationAlert
      });
    } else {
      this.notificationAlert = false;
      this.ouputStateForm.emit({
        estadoForm: this.notificationAlert
      });
    }
  }
}
