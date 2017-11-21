import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { toasterConfig, bsdatepickerConfig } from '../app.config';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { es } from 'ngx-bootstrap/locale';

defineLocale('es', es);

import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/forkJoin';
import * as moment from 'moment/moment';

import * as _ from 'lodash';

// Services
import { CommonExpensesService } from './common-expenses.service';
import { SectorService } from '../services/sector.service';
import { HelperService } from '../services/helpers.service';
import { SettingsService } from '../services/settings.service';
import { PeriodService } from '../services/period.service';
import { FundService } from '../fund/fund.service';
import { InterestFinesService } from '../services/interest-fines.service'


// Models
import { Sector } from '../models/sector.model';
import {AccoutingAccountService} from '../services/accouting-account.service';
import { InterestFine } from '../models/interest-fine.model';


@Component({
  selector: 'app-common-expenses',
  templateUrl: './common-expenses.component.html',
  styleUrls: ['./common-expenses.component.scss']
})
export class CommonExpensesComponent implements OnInit {
  private componentDestroyed: Subject<boolean> = new Subject();
  @ViewChild('modalInfo') modalInfo: ModalDirective;
  public expenseAssign: any[] = [];
  public accountAssign: any[];
  public tempAccountAssign: any[] = [];
  public fundsCommunity = [];
  public mandatoryExpenseAccounts: any[] = [];
  public accountsWithAssign: any[] = [];
  public month: string;
  public year: string;
  public years: string[];
  public period: string;
  public periodObj: any;
  public firstPeriod: string;
  sumAmountAccounting: number = 0;
  communityId: number;
  public sectors: Sector[];
  amountTotal: number = 0;
  amountViewFund: number = 0;
  widthCustomSector: string;
  public months: any[];
  accountWithErrors = [];
  public validateCommonExpense: any[];
  bsConfig: Partial<BsDatepickerConfig>;
  public dataValidated: any;
  public viewAccountSelected: boolean = false;
  public interestFineConfiguration: any = [];
  public isEnableButtonContinueClose = false;
  public isProcessingData: boolean = false;
  public interestFine = {
    periodicidad: '',
    interest_type: '',
    interest_rate: '',
    debt_consider: '',
    fund_name: '',
    description: '',
    capital_reduction: '',
    closure_date: '',
  };
  public interestFineSet = false;
  dateIssue: '';
  dateExpiration: '';
  public validateReadings: any[] = [];
  isUploading: boolean = true;
  public validateExpensesSurcharge: any[] = [];
  public expense: number = 0;

  constructor(
    private _interestFinesService: InterestFinesService,
    private _commonExpensesService: CommonExpensesService,
    private _sectorService: SectorService,
    public _helperService: HelperService,
    private _settingService: SettingsService,
    private _periodService: PeriodService,
    private _fundService: FundService,
    private _accoutingAccountService: AccoutingAccountService,
    private _translateService: TranslateService,
    private toasterService: ToasterService) {
    this.communityId = +localStorage.getItem('communityId');

    this.period = moment(new Date().toISOString()).format('YYYYMM');

  }

  ngOnInit() {
    this.bsConfig = Object.assign({}, bsdatepickerConfig);
    this.communityId = +localStorage.getItem('communityId');
    this._periodService.getMonths().subscribe(months => {
      this.months = months;
    }, error => console.log(error));
    this.loadAll();
  }

  loadAll(forcedPeriod?: string) {
    this.isUploading = true;
    const getSectors = this._sectorService.getAll(this.communityId);
    const getAccountingAssignments = this._commonExpensesService.getAccountAssign(this.communityId);
    const getSettings = this._settingService.getSettings(this.communityId);
    const getFunds = this._fundService.getFunds(this.communityId);
    const getMandatoryExpenseAccounts = this._accoutingAccountService.getAllWithSctors(this.communityId);
    const getConfigurationInterestFines = this._interestFinesService.getConfigurationInterestFines(this.communityId);
    // Loads all the required data
    getSettings.concatMap(settings => {
      const currentPeriodSetting = settings.json().find(x =>
        x.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD');
      const firstPeriodSetting = settings.json().find(x =>
        x.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD');
      this.firstPeriod = firstPeriodSetting.value;
      if (!forcedPeriod) {
        this.period = currentPeriodSetting.value;
      } else {
        this.period = forcedPeriod;
      }
      this._periodService.getPeriodObject(this.period).subscribe(period => {
        this.periodObj = period;
        this.year = this.periodObj.year;
      }, error => console.log(error));
      this._periodService.getYears(this.period, this.firstPeriod).subscribe(years => {
        this.years = years;
      }, error => console.log(error));
      this._periodService.getPeriodMonth(this.period).subscribe(month => {
        this.month = month.number;
      }, error => console.log(error));
      return Observable.forkJoin(this._commonExpensesService.getExpenseAssign(this.communityId, this.period),
        getAccountingAssignments,
        getSectors,
        getFunds,
        this._commonExpensesService.getValidationsCloseCommonExpense(this.communityId, this.period),
        getMandatoryExpenseAccounts,
        getConfigurationInterestFines);
    }).subscribe(result => {
      // console.log('result', result);
      this.expenseAssign = result[0].json();
      this.tempAccountAssign = result[1].json();
      this.accountsWithAssign = this.tempAccountAssign;
      this.sectors = result[2].json();

      this.fundsCommunity = result[3].json();
      this.validateCommonExpense = result[4].json();
      this.validateCommonExpense.forEach((value, i) => {
        if (value.message === 'CONSUMER_SERVICE_VALIDATE') {
          value.data.forEach((data) => {
            if (data.message === 'READINGS_WITHOUT_EXPENSES') {
              data.cs.consumer_service_dist_configs.forEach((config) => {
                if (config.expense_assignments.length > 0) {
                  this.expense = this.expense + 1;
                }
              });
              data.total_expense = this.expense;
              this.expense = 0;
              this.validateReadings.push(data);
            } else if (data.message === 'CONSUMER_SERVICE_NOT_EXPENSE_ASSOICATED') {
              data.cs.consumer_service_dist_configs.forEach((config) => {
                if (config.expense_assignments.length > 0) {
                  this.expense = this.expense + 1;
                }
              });
              data.total_expense = this.expense;
              this.expense = 0;
              this.validateExpensesSurcharge.push(data);
            }
          });
          this.validateCommonExpense.splice(i, 1);
        }
      });
      if (this.validateReadings.length > 0) {
        this.validateCommonExpense.push({ message: 'READINGS_WITHOUT_EXPENSES', data: this.validateReadings });
      }
      if (this.validateExpensesSurcharge.length > 0) {
        this.validateCommonExpense.push({ message: 'CONSUMER_SERVICE_NOT_EXPENSE_ASSOICATED', data: this.validateExpensesSurcharge });
      }
      this.mandatoryExpenseAccounts = result[5].json();
      this.interestFineConfiguration = result[6].json();
      if (this.interestFineConfiguration.length > 0) {
        this.interestFineSet = true;
      }

      this.interestFindParseData();

      this.findAccountAssign();
      this.loadFundsAmounts();
      this.checkMandatoryExpenses();
      this.isUploading = false;
    }, error => {
      console.log(error)
      this.isUploading = false;
    });
  }

  interestFindParseData() {
    this.interestFineConfiguration.forEach((r) => {
      r.interest_fine_metadata.forEach((meta) => {
        if (meta.interest_fine_field.key === 'PERIODICIDAD') {
          this.interestFine.periodicidad = meta.interest_fine_field.name;
        }
        if (meta.interest_fine_field.key === 'TIPO_INTERES') {
          this.interestFine.interest_type = meta.interest_fine_field.name;
        }
        if (meta.interest_fine_field.key === 'TASA') {
          this.interestFine.interest_rate = meta.value;
        }
        if (meta.interest_fine_field.key === 'DEUDA_CONSIDERAR') {
          this.interestFine.debt_consider = meta.interest_fine_field.name;
        }

        if (meta.interest_fine_field.key === 'DEUDA_CONSIDERAR') {

        }
      })

      this.interestFine.fund_name = r.fund.name;
      this.interestFine.description = r.description;
      this.interestFine.capital_reduction = r.capital_reduction ? 'YES' : 'NO';
      this.interestFine.closure_date = r.community_periods[0].closure_date;

    });
  }


  findAccountAssign() {
    this.tempAccountAssign.forEach(element => {
      element.children.forEach(child => {
        child.state = false;
      });
      this.createCommonExpenseObject();
      this.accountAssign = this.tempAccountAssign;
    });
  }

  loadFundsAmounts() {
    if (this.accountAssign && this.accountAssign[0].total > 0) {
      this.fundsCommunity.forEach(fund => {
        fund.total = 0;
        fund.sectors.forEach(fundSector => {
          this.sectors.forEach(sector => {
            if (fundSector.id === sector.id) {
              if (fund.fund_income_type.slug === 'PORCENTAJE_GASTO_COMUN') {
                fundSector.amount = Math.round(this.getAccountTotal(this.accountAssign[0], sector) * fund.amount / 100);
              }
              if (fund.fund_income_type.slug === 'MONTO_FIJO_GASTO_COMUN') {
                fundSector.amount = +fund.amount;
              }
              fund.total = fund.total + fundSector.amount;
            }
          });
        });
      });
    }
  }

  // armamos objeto para mostrar en minuta
  createCommonExpenseObject() {
    this.tempAccountAssign.forEach(parent => { // Gasto común
      parent.total = 0;
      parent.totals = [];
      parent.children.forEach(account => { // cuenta
        account.totals = [];
        account.children.forEach(subAccount => { // subcuenta
          subAccount.totals = [];
          subAccount.account_expense_assignments.forEach(accountExpenseAssignment => {
            accountExpenseAssignment.data = this.searchAccountAssignments(accountExpenseAssignment.assignment);
            const totals = this.calculateAccountTotals(accountExpenseAssignment.data, parent.total, parent.totals, account.totals, subAccount.totals);
            parent.total = totals[0];
            parent.totals = totals[1]
            account.totals = totals[2];
            subAccount.totals = totals[3];
          });
        });
      });
    });
  }

  calculateAccountTotals(data: any, parentTotal: number, parentTotals: any[], accountTotals: any[], subAccountTotals: any[]): any[] {
    const accTotals = accountTotals;
    const subAccTotals = subAccountTotals;
    const mainTotals = parentTotals;
    let mainTotal = parentTotal;
    const totals = [];
    data.forEach(item => {
      item.expense_assignment.expense_fees.forEach(fee => {
        fee.sectors.forEach(sector => {
          mainTotal = mainTotal + (+sector.expense_fee_sector.amo);

          const ixMain = mainTotals.findIndex(x => x.sector === sector.id);
          if (ixMain >= 0) {
            mainTotals[ixMain].amount = mainTotals[ixMain].amount + (+sector.expense_fee_sector.amo);
          } else {
            mainTotals.push({
              sector: sector.id,
              amount: +sector.expense_fee_sector.amo,
            });
          }

          const ixAcc = accTotals.findIndex(x => x.sector === sector.id);
          if (ixAcc >= 0) {
            accTotals[ixAcc].amount = accTotals[ixAcc].amount + (+sector.expense_fee_sector.amo);
          } else {
            accTotals.push({
              sector: sector.id,
              amount: +sector.expense_fee_sector.amo,
            });
          }

          const ixSubAcc = subAccTotals.findIndex(x => x.sector === sector.id);
          if (ixSubAcc >= 0) {
            subAccTotals[ixSubAcc].amount = subAccTotals[ixSubAcc].amount + (+sector.expense_fee_sector.amo);
          } else {
            subAccTotals.push({
              sector: sector.id,
              amount: +sector.expense_fee_sector.amo,
            });
          }
        });
      });
    });
    totals[0] = mainTotal;
    totals[1] = mainTotals;
    totals[2] = accTotals;
    totals[3] = subAccTotals;
    return totals;
  }

  // buscamos las asignaciones que correspondan a cada cuenta
  searchAccountAssignments(idAccountAssign: number): any[] {
    const list = [];
    this.expenseAssign.forEach(expenseAssign => {
      expenseAssign.expense_assignments.forEach(assignment => {
        if (assignment.id === idAccountAssign) {
          list.push({
            id: expenseAssign.id,
            code: expenseAssign.code,
            date: expenseAssign.date,
            expiration_date: expenseAssign.expiration_date,
            amount: expenseAssign.amount,
            description: expenseAssign.description,
            supplier: expenseAssign.supplier,
            expense_type: expenseAssign.expense_type,
            expense_assignment: assignment,
          });
        }
      });
    });
    return list;
  }

  calculateAmountExpenseBySector(sectors: any, sector: any): number {
    const sectorFound = sectors.filter(x => x.id === sector.id);
    if (sectorFound.length > 0) {
      return sectorFound[0].expense_fee_sector.amo;
    }
    return 0;
  }

  getFundTotal(fund: any, sector?: Sector): number {
    let total = 0;
    if (sector) {
      const foundSector = fund.sectors.find(x => x.id === sector.id);
      if (foundSector) {
        total = foundSector.amount ? foundSector.amount : 0;
      }
    } else {
      total = fund.total ? fund.total : 0;
    }
    return total;
  }

  getAccountTotal(account: any, sector: Sector): number {
    let total = {
      sector: 0,
      amount: 0,
    };
    if (account.totals && account.totals.length > 0) {
      total = account.totals.find(element => {
        return element.sector === sector.id;
      });
    }
    return total ? total.amount : 0;
  }

  getCommunityTotal(): number {
    return +this.accountAssign[0].total;
  }

  // al cambiar de periodo se refresca data en vista
  changePeriod() {
    this.accountAssign = null;
    const padMonth = ('0' + this.month).slice(-2);
    const newPeriod = `${this.year}${padMonth}`;
    this.loadAll(newPeriod);
  }

  // mostramos o ocultamos tabla de asignaciones por cuenta
  changeStateAccount(children: any) {
    children.state = !children.state;
  }

  checkSector(selected_sector: any[]): boolean {
    return selected_sector && selected_sector.length > 0 && selected_sector[0].sector && selected_sector[0].amount > 0
  }

  checkIsActiveSector(sector_id: number): string {
    const isActiveSector = _.filter(this.sectors, (sector) => {return sector.id === sector_id});
    return (isActiveSector && isActiveSector.length > 0 ) ? isActiveSector[0].name : null;
  }

  checkMandatoryExpenses() {
    const accountsBySector = [];
    const accounstWithExpenseBySector = [];
    // Inicializamos cuentas de gastos
    this.accountsWithAssign.forEach((accGeneral) => {
      accGeneral.children.forEach((account) => {
        account.children.forEach((account_expense_assignments) => {
          accounstWithExpenseBySector.push({
              id: account_expense_assignments.id,
              parent_id: account_expense_assignments.parent_id,
              name: account_expense_assignments.name,
              alias: account_expense_assignments.alias,
              code: account_expense_assignments.code,
              account_expense_assignments
            }
          );
        });
      })
    });

    // aquí se almacenan las cuentas obligatorias que no cuentan con gastos
    this.accountWithErrors = [];

    // se itera sobre las cuentas obligatorias
    this.mandatoryExpenseAccounts.forEach((accGeneral) => {
      accGeneral.children.forEach((account) => {
        account.children.forEach((accountbysector) => {
          let accBySectorTemp: any = [];
          accountbysector.hasNotExpenses = false;
          accountbysector.sectorsHasNotExpenses = [];
          const sector_account_temp = [];
          this.sectors.forEach(sector => {
            const account_sector = _.filter(accountbysector.account_sectors, (item) => { return item.sector_id === sector.id; })[0];
            sector_account_temp.push({
                                        account_id: accountbysector.id,
                                        sector_id: sector.id,
                                        mandatory: account_sector ? account_sector.mandatory : false,
                                        name: sector.name
              });
          });

          accountbysector.account_sectors = sector_account_temp;

          // la cuenta tiene sectores obligatorios ?
          accBySectorTemp = _.filter(accountbysector.account_sectors, (item) => { return item.mandatory === true; });
          if (accBySectorTemp.length > 0) {
            accBySectorTemp.id = accountbysector.id;
            accBySectorTemp.parent_id = accountbysector.parent_id;
            accBySectorTemp.name = accountbysector.name;
            accBySectorTemp.alias = accountbysector.alias;
            accBySectorTemp.code = accountbysector.code;

            // existen gastos definidos para la cuenta
            const expense_assignments = _.filter(accounstWithExpenseBySector, (item) => { return item.id === accountbysector.id});
            // la cuenta tiene alguna asignación ?
            if (expense_assignments.length > 0) {
              accBySectorTemp.forEach((_account) => {
                const sector_expense = _.filter(expense_assignments[0].account_expense_assignments.totals, (item) => { return item.sector === _account.sector_id });
                // valida si sector tiene gastos y amount > 0
                if (!this.checkSector(sector_expense)) {
                  accountbysector.hasNotExpenses = true;
                  accountbysector.sectorsHasNotExpenses.push({sector_id: _account.sector_id , name: _account.name, mandatory: true });
                }
              })
            } else {
              accountbysector.hasNotExpenses = true;
              // agrega todos los sectores que son obligatorios
              accBySectorTemp.forEach(item => {
                accountbysector.sectorsHasNotExpenses.push({sector_id: item.sector_id , name: accBySectorTemp.name, account_id: accBySectorTemp.account_id, mandatory: true });
              });
            }
            if (accountbysector.hasNotExpenses) {
              this.accountWithErrors.push(accountbysector);
            }
          }
        });
      });
    });

    this.cleanMessageAccountWithOutExpenses();
    if (this.accountWithErrors.length > 0) {
      this.validateCommonExpense.push({message: 'ACCOUNT_WITHOUT_EXPENSES', slug: 'ACCOUNT_WITHOUT_EXPENSES', data: this.accountWithErrors });
    };
  }

  cleanMessageAccountWithOutExpenses() {
    const clean_message = [];
    this.validateCommonExpense.forEach((item) => {
      if (item.message !== 'ACCOUNT_WITHOUT_EXPENSES') {
        clean_message.push(item);
      }
    });
    this.validateCommonExpense = clean_message;
  }

  openModalCloseInfo() {
    this.modalInfo.show();
  }

  hideModalCloseInfo() {
    this.modalInfo.hide();
  }


  onChangeDateModal() {
    setTimeout(() => {
      if (this.interestFineSet && this.interestFine.periodicidad === 'DIARIO') {
        if (this.dateIssue && this.dateExpiration) {
          console.log(this.dateExpiration);
          console.log(this.dateIssue);
          this.isEnableButtonContinueClose = true;
        }
      }

      if (!this.interestFineSet || (this.interestFineSet && this.interestFine.periodicidad === 'MENSUAL')) {
        if (this.dateExpiration !== '') {
          this.isEnableButtonContinueClose = true;
        }
      }
    }, 500)
  }



  closeCommonExpense() {
    this.isProcessingData = true;

    const data = {
      dateIssue: this.interestFine.periodicidad === 'DIARIO' ? this.dateIssue : null,
      dateExpiration: this.dateExpiration,
      periodicity: this.interestFine.periodicidad,
    }
    this._commonExpensesService.closePeriod(data, this.communityId, this.period)
    .subscribe(
      result => {
        this.isProcessingData = false;
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
        .subscribe((translation: string) => {
          this.toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
        });
      },
      error => {
        this.isProcessingData = false;
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((res: string) => {
          this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
        });
      }
    );
  }

  messageValidate(item: any) {
    this.dataValidated = item;
    console.log(item);
  }

  reValidateMandatory() {
    this.isUploading = true;
    this._accoutingAccountService.getAllWithSctors(this.communityId).subscribe((result) => {
      this.mandatoryExpenseAccounts = result.json();
      this.checkMandatoryExpenses();
      this.isUploading = false;
    }, error => {
      this.isUploading = false;
    });
  };

  hasError(account: any , sector: any): boolean {
    let hasError = false;
    account.sectorsHasNotExpenses.forEach(sectors => {
      if (sectors.sector_id === sector.sector_id ) {
          hasError = true;
      }
    });
    return hasError;
    // return _.filter(account.sectorsHasNotExpenses, (sectors) => { return sectors.sector_id === sector.sector_id }) ? false : true;
  }

  changeMandatoryOnSector(item: any, sector: any) {
    let status;
    item.account_sectors.forEach((acc_sector) => {
    if (acc_sector.sector_id === sector.sector_id) {
      acc_sector.mandatory = !acc_sector.mandatory;
      status = acc_sector.mandatory;
      }
    });
    this._accoutingAccountService.setAccountOnSector(this.communityId, item.id, sector.sector_id, { mandatory: status })
      .subscribe(response => {
      }, error => {
        console.log(error);
      })
  }
}
