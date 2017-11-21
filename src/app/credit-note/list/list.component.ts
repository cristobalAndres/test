import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

// Services
import { SettingsService } from '../../services/settings.service';
import { PeriodService } from '../../services/period.service';
import { DebtTypeService } from '../../services/debt-type.service';
import { BillService } from '../../services/bill.service';
import { HelperService } from '../../services/helpers.service';
import { FundService } from '../../fund/fund.service';

// Models
import { DebtTypeModel } from '../../models/debt-type.model';
import { Period } from '../../models/period.model';
import { Fund } from '../../models/fund.model';
import * as moment from 'moment/moment'

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  // variables
  public formCreditsNotes: FormGroup;
  public communityId: number;
  public debtsType: DebtTypeModel[];
  public conceptTypeSelected: DebtTypeModel;
  public funds: Fund[];
  public fundSelected: Fund;
  public periods: Period[];
  public periodSelected: Period;
  public componentDestroyed: Subject<boolean> = new Subject();
  public isLoading: Boolean = true;
  public paymentNotes: any[] = [];
  public paymentNoteAll: Boolean = false;
  public checkAllSwitch: Boolean = false;
  public paymentNoteAllSwitch: Boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _settingService: SettingsService,
    private _periodService: PeriodService,
    private _debtTypeService: DebtTypeService,
    private _billService: BillService,
    private _helpersService: HelperService,
    private _translateService: TranslateService,
    private _toasterService: ToasterService,
    private _fundService: FundService
  ) { }

  ngOnInit() {
    this.initFormAssignments();
    this.communityId = +localStorage.getItem('communityId');
    this.getInitView();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  // iniciamos formBuilder vista
  public initFormAssignments(): void {
    this.formCreditsNotes = this._fb.group({
      period: [new Period, Validators.required],
      deb_type: [null, Validators.required],
      bills: this._fb.array([]),
      fund: [null, Validators.required]
    });
  }

  // iniciamos servicios para vista notas de crédito
  public getInitView(): void {
    const getSettings = this._settingService.getSettings(this.communityId);
    getSettings.concatMap(setting => {
      const settings = setting.json();
      const currentPeriodSetting = settings.find(x =>
        x.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD');
      const currentPeriod = +currentPeriodSetting.value;
      const firstPeriodSetting = settings.find(x =>
        x.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD');
      const firstPeriod = +firstPeriodSetting.value.replace('-', '');
      const dateNow = moment(`${currentPeriod}01`).format();
      const getPeriods = this._periodService.getFuturePeriods(dateNow, 1, (currentPeriod - firstPeriod));
      const getConceptType = this._debtTypeService.getDebtsTypes();
      const getFunds = this._fundService.getFunds(this.communityId);
      return Observable.forkJoin(
        getPeriods,
        getConceptType.map(debtsType => debtsType.json() as DebtTypeModel[]),
        getFunds.map(funds => funds.json() as Fund[]));
    })
      .takeUntil(this.componentDestroyed)
      .subscribe(res => {
        // reiniciamos filtros visuales (switch global y colapsable global)
        this.paymentNoteAll = false;
        this.paymentNoteAllSwitch = false;
        // rescatamos periodos
        this.periods = res[0].reverse();
        if (this.periods) {
          this.periodSelected = this.periods[0];
        }
        // rescatamos conceptos de deuda
        this.debtsType = res[1].filter(m => m.slug !== 'RECARGO_PAGO_INMEDIATO');
        if (this.debtsType) {
          this.conceptTypeSelected = this.debtsType[0];
        }
        // rescatamos fondos
        this.funds = res[2];
        if (this.funds) {
          this.fundSelected = this.funds[0];
        }
        this.getBillingNotes();
      }, error => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
        this.isLoading = false;
      });
  }

  // traemos notas de cobro que coincidan con criterios de búsqueda
  public getBillingNotes(): void {
    this.checkAllSwitch = false;
    this.isLoading = true;
    const options = {
      period: this.periodSelected.period,
      conceptTypeId: this.conceptTypeSelected.id,
      status: 'RELEASED',
    };
    this._billService.getBillingNotes(this.communityId, options)
      .takeUntil(this.componentDestroyed)
      .subscribe(
      notes => {
        // reiniciamos formBuilder principal bill
        if (this.formCreditsNotes.value.bills.length > 0) {
          const countBills = this.formCreditsNotes.value.bills.length;
          if (countBills !== 0) {
            for (let _i = countBills; _i >= 0; _i--) {
              this.removeBill(_i);
            }
          }
        }
        // rescatamos notas de cobro
        this.paymentNotes = notes.json();
        if (this.paymentNotes) {
          this.paymentNotes.forEach(payment => {
            payment.amountPaymentNote = 0;
            payment.amountDebts = this._helpersService.sumOfAmounts(payment.bill_debts, 'amount');
            payment.amountBalance = this._helpersService.sumOfAmounts(payment.bill_debts, 'balance');
            payment.state = false;
            if (payment.bill_debts) {
              payment.bill_debts.forEach(debt => {
                debt.state = false;
                debt.show = false;
              });
            }
            this.addBill(payment);
          });
        }
        this.isLoading = false;
      },
      err => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
        this.isLoading = false;
      });
  }

  // activa o desactiva switch de bill_debt
  public checkedPaymentNoteAll(state: Boolean): void {
    this.paymentNotes.forEach(payment => {
      payment.state = state;
      this.checkedPaymentNote(payment);
    });
  }

  // seleccionar boleta para generarle nota de crédito
  public checkedPaymentNote(paymentNote: any): void {
    const paymentsActive = this.paymentNotes.filter(p => p.state === true);
    if (paymentNote.state) {
      // this.addCreditNote(paymentNote);
      paymentNote.amount = paymentNote.amountDebts;
      paymentNote.amountPaymentNote = 0;
      paymentNote.bill_debts.forEach(debt => {
        this.checkedPaymentNoteDebt(paymentNote, debt);
      });
    } else {
      const _indexPayment = paymentsActive.indexOf(paymentNote);
      // this.removeCreditNote(_indexPayment);
      paymentNote.amount = null;
      paymentNote.bill_debts.forEach(debt => {
        this.checkedPaymentNoteDebt(paymentNote, debt);
      });
    }
    if (paymentsActive.length === this.paymentNotes.length) {
      this.checkAllSwitch = true;
    } else {
      this.checkAllSwitch = false;
    }
  }

  // gestiona nota de crédito para ebt seleccionado
  public checkedPaymentNoteDebtView(paymentNote: any, debt: any): void {
    if (debt.state) {
      debt.state = false;
      debt.amountView = 0;
      const bill = this.formCreditsNotes.value.bills.find(b => b.bill_id === paymentNote.id);
      const _indexBill = this.formCreditsNotes.value.bills.findIndex(b => b.bill_id === paymentNote.id);
      if (bill) {
        const _indexDebt = bill.debts.indexOf(debt);
        this.removeCreditNote(_indexBill, _indexDebt);
      }
    } else {
      debt.state = true;
      debt.amountView = (+debt.balance);
      const _indexBill = this.formCreditsNotes.value.bills.findIndex(b => b.bill_id === paymentNote.id);
      if (_indexBill !== -1) {
        this.addCreditNote(_indexBill, debt);
      }
    }

    const billsDebtActive = paymentNote.bill_debts.filter(b => b.state === true);
    if (billsDebtActive.length !== paymentNote.bill_debts.length) {
      paymentNote.state = false;
    }
    if (billsDebtActive.length === paymentNote.bill_debts.length) {
      paymentNote.state = true;
    }

    paymentNote.amountPaymentNote = 0;
    paymentNote.amountPaymentNote = this._helpersService.sumOfAmounts(paymentNote.bill_debts, 'amountView');
    this._helpersService.sortListProperties(paymentNote.bill_debts);
  }

  // seleccionar boleta para generarle nota de crédito
  public checkedPaymentNoteDebt(paymentNote: any, debt: any): void {
    if (paymentNote.state) {
      debt.state = true;
      debt.amountView = (+debt.balance);
      paymentNote.amountPaymentNote = (paymentNote.amountPaymentNote ? paymentNote.amountPaymentNote : 0) + debt.amountView;
      const _indexBill = this.formCreditsNotes.value.bills.findIndex(b => b.bill_id === paymentNote.id);
      if (_indexBill !== -1) {
        this.addCreditNote(_indexBill, debt);
      }
    } else {
      debt.state = false;
      paymentNote.amountPaymentNote = (paymentNote.amountPaymentNote ? paymentNote.amountPaymentNote : 0) - debt.amountView;
      debt.amountView = 0;
      const bill = this.formCreditsNotes.value.bills.find(b => b.bill_id === paymentNote.id);
      const _indexBill = this.formCreditsNotes.value.bills.findIndex(b => b.bill_id === paymentNote.id);
      if (bill) {
        const _indexDebt = bill.debts.indexOf(debt);
        this.removeCreditNote(_indexBill, _indexDebt);
      }
    }
  }

  // updatea monto de nota de crédito
  public updateAmountCreditNote(paymentNote: any): void {
    const creditsNotes = this.formCreditsNotes['controls'].bills.value;
    const creditNote = creditsNotes.find(c => c.bill_id === paymentNote.id);
    if (creditNote) {
      const _index = creditsNotes.findIndex(p => p.bill_id === paymentNote.id);
      this.formCreditsNotes['controls'].bills['controls'][_index]['controls'].amount.setValue(paymentNote.amount);
    }
  }

  // updatea monto de debt a sumar a nota de crédito
  public updateAmountCreditNoteDebt(paymentNote: any, debt: any): void {
    paymentNote.amountPaymentNote = 0;
    paymentNote.amountPaymentNote = this._helpersService.sumOfAmounts(paymentNote.bill_debts, 'amountView');
    const bill = this.formCreditsNotes.value.bills.find(b => b.bill_id === paymentNote.id);
    const _indexBill = this.formCreditsNotes.value.bills.findIndex(b => b.bill_id === paymentNote.id);
    if (bill) {
      const _indexDebt = bill.debts.findIndex(d => d.id === debt.id);
      this.formCreditsNotes['controls'].bills['controls'][_indexBill]['controls'].debts['controls'][_indexDebt]['controls'].amountBillDebt.setValue(debt.amountView);
    }
  }

  // eliminamos nota de crédito para boleta
  public removeCreditNote(_indexBill: number, _indexDebt: number) {
    const ctrl = <FormArray>this.formCreditsNotes['controls'].bills['controls'][_indexBill]['controls'].debts;
    ctrl.removeAt(_indexDebt);
  }

  // añadir nota de crédito a boleta en formulario
  public addCreditNote(_indexBill: number, debt: any) {
    const control = <FormArray>this.formCreditsNotes['controls'].bills['controls'][_indexBill]['controls'].debts;
    const addrCtrl = this.generateCreditNoteForPaymentNote(debt);
    control.push(addrCtrl);
  }

  // eliminamos nota de crédito para boleta
  public removeBill(_indexBill: number) {
    const ctrl = <FormArray>this.formCreditsNotes['controls'].bills;
    ctrl.removeAt(_indexBill);
  }

  // añadir boleta a formulario
  public addBill(paymentNote: any) {
    const control = <FormArray>this.formCreditsNotes.controls['bills'];
    const addrCtrl = this.generateBill(paymentNote);
    control.push(addrCtrl);
  }

  // creación de boleta en formulario
  public generateBill(paymentNote: any) {
    return this._fb.group({
      bill_id: paymentNote.id,
      amount: this._helpersService.sumOfAmounts(paymentNote.bill_debts, 'amount'),
      property_id: paymentNote.property.id,
      property_name: paymentNote.property.name,
      period: this.periodSelected.period,
      debt_type_id: this.conceptTypeSelected.id,
      debts: this._fb.array([])
    });
  }

  // creación objeto nota de cobro para boleta
  public generateCreditNoteForPaymentNote(debt: any) {
    return this._fb.group({
      id: debt.id,
      amount: debt.amountView,
      amountBillDebt: (+debt.amount),
      balance: +debt.balance,
    });
  }

  // verificamos estado de bil_debt
  public stateBillDebt(debt: any): string {
    if (debt) {
      if ((+debt.balance) === 0) {
        return 'PAGADA';
      }
      if (((debt.balance !== debt.amount) && (+debt.balance) !== 0)) {
        return 'PARTIAL';
      }
    } else {
      return 'NULL';
    }
  }

  // verificamos estado de formulario apra habilitar envío de notas de crédito
  public validateButtonSendCreditNote(): Boolean {
    let state = true;
    if (this.formCreditsNotes.value.bills) {
      this.formCreditsNotes.value.bills.forEach(bill => {
        if (bill.debts.length > 0) {
          state = false;
        }
      });
    }
    return state;
  }

  // oculta o muestra bill_debt para cada bill en vista
  public showBiltDebts(paymentNote: any): void {
    paymentNote.show = !paymentNote.show;
    // verificamos cuantos bill estan desplegados mostrando detalle
    const showBills = this.paymentNotes.filter(p => p.show === true);
    if (showBills.length === 0) {
      this.paymentNoteAll = false;
    }
    if (showBills.length === this.paymentNotes.length) {
      this.paymentNoteAll = true;
    }
  }

  // cierra o collapsa todos los bill_debts para cada bill
  public showBiltDebtsAll(): void {
    if (this.paymentNoteAll) {
      this.paymentNoteAll = !this.paymentNoteAll;
      this.paymentNotes.forEach(payment => payment.show = this.paymentNoteAll);
    } else {
      this.paymentNoteAll = !this.paymentNoteAll;
      this.paymentNotes.forEach(payment => payment.show = this.paymentNoteAll);
    }

  }

  // creamos notas de crédito
  public saveCreditNotes(formCreditsNotes: any): void {
    this.isLoading = true;
    this._billService.postCreditNotes(this.communityId, formCreditsNotes)
      .subscribe(response => {
        this.getInitView();
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'CREDIT_NOTE.NOTIFICATION.SUCCESS_CREDIT_NOTE'])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            this._toasterService.pop('success',
              translation['GENERAL.SUCCESS_TITLE'], translation['CREDIT_NOTE.NOTIFICATION.SUCCESS_CREDIT_NOTE']);
          });
      },
      err => {
        this.isLoading = false;
        this._translateService.get(['GENERAL.ERROR_TITLE', 'CREDIT_NOTE.NOTIFICATION.ERROR_CREDIT_NOTE'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['CREDIT_NOTE.NOTIFICATION.ERROR_CREDIT_NOTE']);
          });
      });
  }
}
