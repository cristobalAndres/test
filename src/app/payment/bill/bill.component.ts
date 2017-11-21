import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

import { BillService } from '../../services/bill.service';
import { WalletService } from '../../services/wallet.service';
import { PaymentService } from '../../services/payment.service';
import { BankService } from '../../bank/bank.service';
import { PropertyService } from '../../services/property.service';
import { BankAccountService } from '../../services/bank.service';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import { MaskNumberFormat,  } from '../../mixing/number-format.mixing';

import { Bill } from '../../models/bill.model';
import { Debt } from '../../models/debt.model';
import { PaymentItem } from '../../models/payment-item.model';
import { WalletIncomeType } from '../../models/wallet-income-type.model';
import { Bank as BankModel } from '../../models/bank.model';
import { PaymentData } from '../../models/payment-data.model';
import { BankAccount } from '../../models/bank-account.model';
import * as _ from 'lodash';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { toasterConfig, bsdatepickerConfig } from '../../app.config';
import { Property } from '../../models/property.model';

import * as moment from 'moment/moment';

// DataPicker
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { es } from 'ngx-bootstrap/locale';

defineLocale('es', es);

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  public communityId: number;
  public propertyId: number;
  public bills: Bill[] = [];
  public last: any = [];
  public lastPayment = {};
  public billDebtCollection: Debt[] = [];
  public bankAccountCollection: BankAccount[] = [];
  public debtResume: any;
  public positiveBalance: any = { balance: 0 };
  public property: Property = new Property();
  public paymentData: PaymentData = new PaymentData();
  public paymentItem: PaymentItem = new PaymentItem();
  public incomeTypes: WalletIncomeType[] = [];
  public incomeTypesFiltered: WalletIncomeType[] = [];
  public incomeTypeSelected: WalletIncomeType = new WalletIncomeType();
  public banks: BankModel[] = [];
  public bankSelected: BankModel = new BankModel();
  public toasterConfig = toasterConfig;
  public isProcessingData: boolean = false;
  public successData: Boolean = null;
  public isImmediatePaySurcharge: Boolean = false;
  public isEnablePositiveBalance: Boolean = true;
  public maskNumberFormat = MaskNumberFormat;

  isReadyToShow: boolean = false;
  isBillsReady: boolean = false;
  isPaymentsReady: boolean = false;
  isWalletReady: boolean = false;
  public balance: number;
  advance: boolean = false;
  bsConfig: Partial<BsDatepickerConfig>;


  constructor(private billService: BillService,
    private bankService: BankService,
    private bankAccountService: BankAccountService,
    private walletService: WalletService,
    private paymentService: PaymentService,
    private propertyService: PropertyService,
    private cd: ChangeDetectorRef,
    private toasterService: ToasterService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    // configura selector de período
    this.bsConfig = Object.assign({}, bsdatepickerConfig);
    this.route.paramMap
      .subscribe((params: ParamMap) => {
        this.advance = params.get('advance') === 'true';
        console.log(this.advance);
      });

    this.updateResume();
    this.bankService.all().subscribe(data => this.banks = data.json() as BankModel[]);
    this.walletService.getIncomeTypes().subscribe(data => this.incomeTypes = data.json() as WalletIncomeType[]);

    this.communityId = +localStorage.getItem('communityId');

    this.bankAccountService.all(this.communityId).subscribe(data => {
      this.bankAccountCollection = data.json() as BankAccount[];
      if (this.bankAccountCollection) {
        this.paymentData.bank_account_id = this.bankAccountCollection.find(bc => bc.is_default === true).id;
      }
    });
    this.paymentService.getNextFolio(this.communityId).subscribe(folio => this.paymentData.folio = folio.json() ? +folio.json().folio + 1 : 1);

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.propertyId = +params['id'];

        this.propertyService.findById(this.communityId, this.propertyId).subscribe(property => {
          this.property = property.json() as Property;
        });
        this.getAllBills(this.propertyId);
        this.getLastPayment(this.propertyId);
        this.walletService.getPositiveBalance(this.propertyId).subscribe(pb => {
          this.positiveBalance = pb.json();
          this.balance = +this.positiveBalance.balance
          this.updateResume();
          this.isWalletReady = true;
        });
      }
    });
  }

  getAllBills(propertyId: number): void {
    let billObservable = this.billService.all(propertyId);
    if (this.advance) {
      billObservable = this.billService.allAdvance(propertyId);
    }
    billObservable
      .takeUntil(this.componentDestroyed)
      .subscribe(
      data => {
        this.bills = data.json() as Bill[]
        this.isBillsReady = true;
      },
      error => {
        console.log('data error', error);
        this.isBillsReady = true;
      },
      () => this.loadDebts()
      );
  }

  changeDateModel(date: any): void {
    this.paymentData.date = moment(date).format('YYYY-MM-DD hh:mm');
  }

  getLastPayment(propertyId: number): void {
    this.paymentService.lastPayment(propertyId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
      data => {
        this.isPaymentsReady = true;
        this.last = data.json();
        if (this.last.length !== 0) {
          this.lastPayment = {
            amount: this.last[0].amount,
            folio: this.last[0].folio,
            date: this.last[0].created_at
          }
        }
      },
      error => {
        console.log('data error', error);
        this.isPaymentsReady = true;
      });
  }

  getReadyToShow(): boolean {
    return this.isBillsReady && this.isPaymentsReady && this.isWalletReady;
  }

  loadDebts(): void {
    this.bills.forEach(el => this.getDebt(el));
  }

  removeBill(bill: Bill): void {
    this.bills = this.bills.filter(b => b.id !== bill.id);
  }

  getDebt(bill: Bill): void {
    if (!this.billDebtCollection.hasOwnProperty(bill.id)) {
      this.billService.getDebt(bill.id)
        .takeUntil(this.componentDestroyed)
        .subscribe(
        data => {
          if (data.json().length > 0) {
            this.billDebtCollection[bill.id] = data.json();
            this.cd.markForCheck();
          } else {
            this.removeBill(bill);
          }
        }
        );
    }
  }

  onChangeActivePositiveBalance() {
    this.isEnablePositiveBalance = !this.isEnablePositiveBalance;
    this.updateResume();
  }

  updateResume(): void {
    const totalDebt = _.sumBy(this.paymentData.debits, (d) => +d.deposit);
    const totalPaymentItems = _.sumBy(this.paymentData.credits, (p) => +p.payment_amount);
    let pb = +this.positiveBalance.balance;
    if (!this.isEnablePositiveBalance && this.isImmediatePaySurcharge) {
      pb = 0;
    }
    this.debtResume = {
      debt: totalDebt,
      // PAY: Si esta en la vista de los pagos el pago considera el saldo a favor, si no es asi no lo considera
      pay: ((!this.advance) ? (totalPaymentItems + pb) : (totalPaymentItems)),
      balance: totalPaymentItems + pb - totalDebt,
    };
    if (this.debtResume.debt < 1) {
      this.isImmediatePaySurcharge = false;
    }
  }

  isSelectedDebt(debt: Debt): boolean {
    const isSelected = this.paymentData.debits.find(d => {
      return d.id === debt.id;
    });
    return isSelected != null;
  }

  isShowCheckPositiveBalance(): void {
    this.isImmediatePaySurcharge = false
    this.paymentData.debits.forEach((p) => {
      if (p.debt_type.slug === 'RECARGO_PAGO_INMEDIATO') {
        this.isImmediatePaySurcharge = true;
      }
    })
  }

  onSelectedDebt(debt: Debt): void {
    const filterDebt = this.paymentData.debits.filter(d => d.id !== debt.id);
    if (filterDebt.length === this.paymentData.debits.length) {
      debt.balance = +debt.balance;
      debt.deposit = debt.balance;
      this.paymentData.debits.push(debt);
    } else {
      this.paymentData.debits = filterDebt;
    }
    this.isShowCheckPositiveBalance();
    this.updateResume();
  }

  removeDebtItem(de: Debt): void {
    this.paymentData.debits = this.paymentData.debits.filter(d => d.id !== de.id);
    this.isShowCheckPositiveBalance();
    this.updateResume();
  }

  updateDeposit(event: any, de: Debt): void {
    de.deposit = (de.deposit > +de.balance) ? +de.balance : de.deposit;
    this.updateResume();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  incomeTypeChange(): void {
    if (+this.paymentItem.wallet_income_type_id === 0) {
      this.incomeTypeSelected = new WalletIncomeType();
    } else {
      this.incomeTypeSelected = this.getIncomeType(+this.paymentItem.wallet_income_type_id);
    }
  }

  bankChange(): void {
    if (+this.paymentItem.payment_income_origin_id === 0) {
      this.bankSelected = new BankModel();
    } else {
      this.bankSelected = this.banks.find(bank => {
        return bank.id === +this.paymentItem.payment_income_origin_id;
      });
    }
  }

  bankAccountChange(): void {
    if (+this.paymentData.bank_account_id === 0) {
      this.paymentData.bank_account = new BankAccount();
    } else {
      this.paymentData.bank_account = this.bankAccountCollection.find(bank => {
        return bank.id === +this.paymentData.bank_account_id;
      });
    }
  }

  newPaymentItem(): void {
    this.paymentItem = new PaymentItem();
    this.incomeTypeSelected = new WalletIncomeType();

    if (this.paymentData.credits.length > 0) {
      this.incomeTypesFiltered = this.incomeTypes.filter(i => {
        return ['CASH', 'CHECK'].some(c => (i.slug === c))
      });
    } else {
      this.incomeTypesFiltered = this.incomeTypes;
    }
    this.updateResume();
  }

  getIncomeType(id: number): WalletIncomeType {
    return this.incomeTypes.find(it => {
      return it.id === id;
    });
  }

  removePaymentItem(pi: PaymentItem): void {
    this.paymentData.credits = this.paymentData.credits.filter(payItem => payItem.id !== pi.id);
    this.checkUniquePayment();
    this.newPaymentItem();
  }

  checkUniquePayment(): void {
    this.paymentData.haveUniquePayment = ['TRANSFER', 'DEPOSIT'].includes(this.incomeTypeSelected.slug)
  }

  addPaymentItem(): void {
    this.paymentItem.wallet_income_type = this.incomeTypeSelected;
    this.paymentItem.payment_income_origin = this.bankSelected;
    this.paymentItem.payment_amount = Math.abs(this.paymentItem.payment_amount);
    this.paymentData.credits.push(this.paymentItem);
    this.checkUniquePayment();
    this.newPaymentItem();
  }

  resetPayment(): void {
    this.paymentData.credits = [];
    this.newPaymentItem();
  }

  createPayment(): void {
    this.isProcessingData = true;
    let initialBalance = +this.positiveBalance.balance;
    if (this.isImmediatePaySurcharge && !this.isEnablePositiveBalance) {
      initialBalance = 0;
    }

    const data = {
      date: moment(this.paymentData.date).format('YYYY-MM-DD'),
      comments: this.paymentData.comments,
      folio: this.paymentData.folio,
      bank: this.paymentData.bank_account,
      debt: this.debtResume.debt,
      pay: this.debtResume.pay,
      balance: this.debtResume.balance,
      initial_balance: +initialBalance,
      debit: this.paymentData.debits,
      credit: this.paymentData.credits
    };

    this.paymentService.pay(this.propertyId, data)
      .takeUntil(this.componentDestroyed)
      .subscribe(
      payment => {
        this.successData = true;
        this.translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            this.toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
          });
      },
      err => {
        this.successData = false;
        this.translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .takeUntil(this.componentDestroyed)
          .subscribe((res: string) => {
            this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
      },
      () => setTimeout(() => {
        if (!this.advance) {
          this.router.navigate(['/payment/list']);
        } else {
          this.router.navigate(['/payment/advance']);
        }
      }, 3000)
      );
  }
}
