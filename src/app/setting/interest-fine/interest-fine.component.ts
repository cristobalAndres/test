import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

// Services
import { InterestFineService } from './interest-fine.service';
import { AssignmentsTypeService } from '../../services/assignment-type.service';
import { FundService } from '../../fund/fund.service';
import { DebtTypeService } from '../../services/debt-type.service';

// Models
import { InterestFine } from '../../models/interest-fine.model';
import { Fund } from '../../models/fund.model';
import { AssignType } from '../../models/assign-type.model'

@Component({
  selector: 'app-interest-fine',
  templateUrl: './interest-fine.component.html',
  styleUrls: ['./interest-fine.component.scss']
})
export class InterestFineComponent implements OnInit, OnDestroy {

  communityId: number;
  formSetting: FormGroup;
  periodicities: any;
  interestType: any;
  componentDestroyed: Subject<boolean> = new Subject();
  isLoading: Boolean = false;
  funds: Fund[];
  debtsType: AssignType[];
  lastInterestForDebt: InterestFine = new InterestFine;
  listMetadata: any;
  showConceptDebt: Boolean = true;
  namePeriodicity: string;
  nameInterestType: string;
  stateSwitchReduction: Boolean = false;
  showPorcentTasa: Boolean = true;
  debTypesRequest: any;
  hadFunds: boolean = false;

  constructor(private _formBuilder: FormBuilder,
              private _translateService: TranslateService,
              private _toasterService: ToasterService,
              private _interestForDebtService: InterestFineService,
              private _fundService: FundService,
              private _debtTypeService: DebtTypeService) {
    this.initFormInterestForDebt();


  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.formSetting.controls['community_id'].setValue(this.communityId);
    const getMetadataInterestForDebt = this._interestForDebtService.getMetadataInterestForDebt(['PERIODICIDAD', 'TIPO_INTERES']);
    const getFunds = this._fundService.getFunds(this.communityId);
    const getDebtTypes = this._debtTypeService.getDebtsTypes();
    const getLastInterestDebt = this._interestForDebtService.getInterestFine(this.communityId, true);
    const getAllMetadata = this._interestForDebtService.getMetadataInterestForDebt(null);
    this.isLoading = true;
    Observable.forkJoin(
      getLastInterestDebt,
      getMetadataInterestForDebt,
      getFunds,
      getDebtTypes,
      getAllMetadata)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          // recuperamos configuración de interés actual (de existir)
          const lastInterest = data[0].json();
          if (lastInterest.length > 0) {
            this.lastInterestForDebt = lastInterest;

            lastInterest[0].interest_fine_metadata.forEach(element => {
              if (element.interest_fine_field) {
                if (element.interest_fine_field.key === 'TASA') {
                  if (element.interest_fine_field.name === 'MAXIMO_CONVENCIONAL') {
                    this.formSetting.controls['interest_rate_id'].setValue(false);
                    this.showPorcentTasa = false;
                  }
                  if (element.interest_fine_field.name === 'PORCENTAJE') {
                    this.formSetting.controls['interest_rate_id'].setValue(true);
                    this.showPorcentTasa = true;
                    this.formSetting.controls['porcent'].setValue(+element.value);
                  }
                }
                if (element.interest_fine_field.key === 'DEUDA_CONSIDERAR') {
                  if (element.interest_fine_field.name === 'TODA') {
                    this.formSetting.controls['debt'].setValue(true);
                    this.showConceptDebt = true;
                  }
                  if (element.interest_fine_field.name === 'CONCEPTO_DEUDA') {
                    this.formSetting.controls['debt'].setValue(false);
                    this.showConceptDebt = false;
                  }
                }
              }
            });

            this.formSetting.controls['description'].setValue(lastInterest[0].description);
            const listDebtType = []; // 1, 2, 3, 4
            lastInterest[0].debt_types.forEach(debtType => {
              listDebtType.push(debtType.id);
            });
            this.formSetting.controls['debt_type'].setValue(listDebtType);
            this.stateSwitchReduction = lastInterest[0].capital_reduction;
          }
          // recuperamos metadata para desplegar en formulario (select) PERIODICIDAD
          this.periodicities = data[1].json().filter(p => p.key === 'PERIODICIDAD');
          if (this.periodicities) {
            if (this.lastInterestForDebt[0]) {
              this.lastInterestForDebt[0].interest_fine_metadata.forEach(element => {
                if (element.interest_fine_field.key === 'PERIODICIDAD') {
                  this.namePeriodicity = element.interest_fine_field.name;
                }
              });
            }
            this.periodicities.forEach(element => {
              if (element.name === this.namePeriodicity) {
                this.formSetting.controls['periodicidad_id'].setValue(element);
              }
              if (!this.namePeriodicity) {
                this.formSetting.controls['periodicidad_id'].setValue(this.periodicities[0]);
              }
            });
          }
          // recuperamos metadata para desplegar en formulario (select) TIPO_INTERES
          this.interestType = data[1].json().filter(p => p.key === 'TIPO_INTERES');
          if (this.interestType) {
            if (this.lastInterestForDebt[0]) {
              this.lastInterestForDebt[0].interest_fine_metadata.forEach(element => {
                if (element.interest_fine_field.key === 'TIPO_INTERES') {
                  this.nameInterestType = element.interest_fine_field.name;
                }
              });
            }
            this.interestType.forEach(element => {
              if (element.name === this.nameInterestType) {
                this.formSetting.controls['interest_type_id'].setValue(element);
              }
              if (!this.nameInterestType) {
                this.formSetting.controls['interest_type_id'].setValue(this.interestType[0]);
              }
            });
          }
          // recuperamos fondos
          this.funds = data[2].json();
          if (this.funds.length > 0) {
            this.formSetting.controls['fund_id'].setValue(this.funds[0].id);
            if (lastInterest[0]) {
              if (lastInterest[0].fund.id) {
                this.formSetting.controls['fund_id'].setValue(lastInterest[0].fund.id);
              }
            }
            this.hadFunds = true;
          } else {
            const RESPONSE_ERROR_MESSAGE = 'SETTINGS.LATE_PAYMENT.ERROR.NOTFUND';
            this._translateService.get(['SETTINGS.LATE_PAYMENT.ERROR.NOTFUND', RESPONSE_ERROR_MESSAGE])
              .subscribe((res: string) => {
                this._toasterService.pop('error', res['SETTINGS.LATE_PAYMENT.ERROR.TITLE'], res[RESPONSE_ERROR_MESSAGE]);
              });
          }
          // recuperamos tipos de deudas
          this.debtsType = data[3].json().filter(dt => dt.slug !== 'RECARGO_PAGO_INMEDIATO');
          if (this.debtsType) {
            this.debtsType.forEach((debt, _index) => {
              const listConcept = this.formSetting.controls['debt_type'].value;
              const element = this.debtsType[_index];
              if (listConcept) {
                if (listConcept.indexOf(element.id) === -1) {
                  this.debtsType[_index].state = false;
                } else {
                  this.debtsType[_index].state = true;
                }
              }
            });
            this.debTypesRequest = this.debtsType;
          }
          // recuperamos todos los metadata disponibles
          this.listMetadata = data[4].json();
          this.isLoading = false;
        },
        error => {
          const RESPONSE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', RESPONSE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[RESPONSE_ERROR_MESSAGE]);
            });
          this.isLoading = false;
        });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  public changeTasa(): void {
    this.showPorcentTasa = !this.showPorcentTasa;
    if (!this.showPorcentTasa) {
      this.formSetting.controls['porcent'].setValue(0);
    }
  }

  public switchReduction(state: Boolean): void {
    this.formSetting.controls['capital_reduction'].setValue(state);
  }

  public initFormInterestForDebt(): void {
    this.formSetting = this._formBuilder.group({
      community_id: this.communityId,
      periodicidad_id: [this.lastInterestForDebt.periodicidad_id, Validators.required],
      interest_type_id: [this.lastInterestForDebt.interest_type_id, Validators.required],
      interest_rate_id: [this.lastInterestForDebt.interest_rate_id, Validators.required],
      porcent: this.lastInterestForDebt.porcent,
      debt: [this.lastInterestForDebt.debt, Validators.required],
      fund_id: [this.lastInterestForDebt.fund_id, Validators.required],
      description: this.lastInterestForDebt.description !== null ? this.lastInterestForDebt.description : '',
      capital_reduction: [this.lastInterestForDebt.capital_reduction, Validators.required],
      active: true,
      debt_type: [[]],
      community_periods: {community_period_id: 1},
      interest_fine_metadata: this._formBuilder.array([])
    });
  }

  public valdiatePorcent() {
    const porcent = this.formSetting.controls['porcent'].value;
    if (porcent > 100) {
      this.formSetting.controls['porcent'].setValue(100);
    }
  }

  public conceptDebt(debt: any): void {
    const arreyDebt = this.formSetting.controls['debt_type'].value;
    if (arreyDebt === null) {
      this.formSetting.controls['debt_type'].value.push(debt.id);
    } else {
      const position = arreyDebt.indexOf(debt.id);
      if (position === -1) {
        debt.state = true;
        this.formSetting.controls['debt_type'].value.push(debt.id);
      } else {
        const ctrl = this.formSetting.controls['debt_type'].value;
        ctrl.splice(position, 1);
      }
    }
  }

  public changeState(): void {
    this.showConceptDebt = !this.showConceptDebt;
    if (!this.showConceptDebt) {
      if (this.debtsType) {
        this.debtsType.forEach((debt, _index) => {
          const debtRequest = this.debTypesRequest.find(d => d.id === debt.id);
          if (debtRequest) {
            debt.state = debtRequest.state;
          }
        });
      }
    }
  }

  // guardar configuración
  public saveSetting(interestForDebt: InterestFine): void {
    this.isLoading = true;
    let metaIdTasaMax = null;
    let metaIdTasaFixed = null;
    this.listMetadata.forEach(element => {
      let state = this.formSetting.controls['interest_rate_id'].value;
      state = JSON.parse(state);
      if (element.key === 'TASA' && element.name === 'MAXIMO_CONVENCIONAL') {
        if (state === false) {
          metaIdTasaMax = element.id;
          interestForDebt.interest_fine_metadata.push({
            interest_fine_field_id: metaIdTasaMax,
            value: this.formSetting.controls['porcent'].value
          });
        }
      }
      if (element.key === 'TASA' && element.name === 'PORCENTAJE') {
        if (state === true) {
          metaIdTasaFixed = element.id;
          interestForDebt.interest_fine_metadata.push({
            interest_fine_field_id: metaIdTasaFixed,
            value: this.formSetting.controls['porcent'].value
          });
        }
      }
    });
    interestForDebt.interest_fine_metadata.push({
      interest_fine_field_id: interestForDebt.periodicidad_id.id,
      value: null
    });
    interestForDebt.interest_fine_metadata.push({
      interest_fine_field_id: interestForDebt.interest_type_id.id,
      value: null
    });
    // se ingresa criterio deuda a considerar
    if (this.showConceptDebt === true) {
      this.listMetadata.forEach(metadata => {
        if (metadata.key === 'DEUDA_CONSIDERAR' && metadata.name === 'TODA') {
          interestForDebt.debt_type = [];
          interestForDebt.interest_fine_metadata.push({interest_fine_field_id: metadata.id});
        }
      });
    } else {
      this.listMetadata.forEach(metadata => {
        if (metadata.key === 'DEUDA_CONSIDERAR' && metadata.name === 'CONCEPTO_DEUDA') {
          interestForDebt.interest_fine_metadata.push({interest_fine_field_id: metadata.id});
        }
      });
    }

    if (interestForDebt.debt_type.length === 0) {
      interestForDebt.debt_type = [];
    }

    console.log('interestForDebt:', interestForDebt);

    this._interestForDebtService.postInterestForDebt(this.communityId, interestForDebt)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        response => {
          this.isLoading = false;
          this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this._toasterService.pop('success',
                translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
            });
        },
        error => {
          this.isLoading = false;
          const data = error;
          const messageKey = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';

          this._translateService.get(['GENERAL.ERROR_TITLE', messageKey])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              switch (+error.status) {
                case 404:
                  this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                  break;
                case 500:
                  this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                  break;
                case 400:
                  this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                  break;
                default:
                  this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                  break;
              }
            });
        });
  }

}
