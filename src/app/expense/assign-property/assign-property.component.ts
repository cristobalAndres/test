import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

// Services
import { MethodsCalculateService } from '../../services/method-calculate.service';
import { ExpenseService } from './../expense.service';
import { SettingsService } from '../../services/settings.service';
import { PropertyService } from '../../services/property.service';
import { SectorService } from '../../services/sector.service';
import { PeriodService } from '../../services/period.service';
import { FundService } from '../../fund/fund.service';
import { SurchargeService } from '../../surcharge/surcharge.service';
import { HelperService } from '../../services/helpers.service';

// Model
import { ExpenseAssign, ExpenseAssignView } from '../../models/expense-assign.model';
import { MethodCalculate } from '../../models/method-calculate.model';
import { Property } from '../../models/property.model';
import { Sector } from '../../models/sector.model';
import { Period } from '../../models/period.model';
import { Fund } from '../../models/fund.model';
import * as moment from 'moment/moment';

@Component({
  selector: 'app-assign-property',
  templateUrl: './assign-property.component.html',
  styleUrls: ['./assign-property.component.scss']
})
export class AssignPropertyComponent implements OnInit, OnDestroy {

  @ViewChild('confirmBalanceAssignment') public confirmBalanceAssignment: ModalDirective;
  @ViewChild('confirmationChangeExpense') public confirmationChangeExpense: ModalDirective;
  public data: ExpenseAssignView[] = [];
  public filterQuery = '';
  public formAssignment: FormGroup;
  public communityId: number;
  public isUploading: Boolean = true;
  public componentDestroyed: Subject<boolean> = new Subject();
  public properties: Property[];
  public propertiesAux: Property[];
  public showProperties: Boolean = false;
  public methods: MethodCalculate[];
  public expenseSelected: ExpenseAssignView;
  public expenseSelectedModal: ExpenseAssign;
  public expenseAmountSelected: number = 0;
  public expenseAmountSelectedAux: number;
  public expenseAmountSelectedLast: number;
  public typeCalculate: string;
  public sectors: Sector[];
  public periods: Period[];
  public funds: Fund[];
  public categories: any[] = [];
  public dateNow: string;
  public sectorSelected: Sector;
  public methodSelected: MethodCalculate;
  public categorySelected: number;
  public periodSelected: Period;
  public showFundsAssign: Boolean = false;
  public formAmountAssignments: Boolean = false;
  public proportion: any = 0;
  public radioType: any = null;
  public differenceNotification = {
    value: null,
    value2: null
  };
  public checkAllSwitch: Boolean;

  constructor(
    private _fb: FormBuilder,
    private _methodCalculateService: MethodsCalculateService,
    private _translateService: TranslateService,
    private _expenseService: ExpenseService,
    private _settingService: SettingsService,
    private _propertyService: PropertyService,
    private _toasterService: ToasterService,
    private _sectorService: SectorService,
    private _periodService: PeriodService,
    private _fundService: FundService,
    private _surchargeService: SurchargeService,
    private _helpersService: HelperService
  ) {
    this.dateNow = moment(new Date().toISOString()).format();
  }

  ngOnInit() {
    this.formAssignment = this._fb.group({
      expense: [null, Validators.required],
      sector: [new Sector, Validators.required],
      period: [new Period, Validators.required],
      method: [null, Validators.required],
      amount: [null, Validators.required],
      surcharge_category_id: null,
      surcharge_property: this._fb.array([]),
      difference: this._fb.group({
        amountDifference: null,
        fund: null,
        account: null
      })
    });

    this.communityId = +localStorage.getItem('communityId');
    this.getData();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  // carga data desde API e iniciamos logica de vista Asignación de Gastos a Inmuebles
  getData() {
    const getSettings = this._settingService.getSettings(this.communityId);
    const getExpenses = this._expenseService.allAssign(this.communityId);
    const getPropertys = this._propertyService.all(this.communityId);
    const getSectors = this._sectorService.getAll(this.communityId);
    const getFunds = this._fundService.getFunds(this.communityId);
    const getMethodsCalculate = this._methodCalculateService.getMethods();
    const getSurchargeCategoty = this._surchargeService.getCategory(this.communityId);

    getSettings.concatMap(setting => {
      const settings = setting.json();
      const currentPeriodSetting = settings.find(x => x.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD');
      const currentPeriod = currentPeriodSetting.value;
      const firstPeriodSetting = settings.find(x => x.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD');
      const initPeriod = firstPeriodSetting.value.replace('-', '');
      return Observable.forkJoin(
        getExpenses.map(expenses => expenses.json() as ExpenseAssign[]),
        getPropertys.map(properties => properties.json() as Property[]),
        getSectors.map(sectors => sectors.json() as Sector[]),
        this._periodService.getFuturePeriods(currentPeriod ? moment(currentPeriod, 'YYYYMM').format() : this.dateNow, 12),
        getFunds.map(funds => funds.json() as Fund[]),
        getMethodsCalculate,
        getSurchargeCategoty
      );
    })
      .takeUntil(this.componentDestroyed)
      .subscribe(res => {
        // expenses data
        this.data = [];
        this.isUploading = false;
        const expenseAssignments = res[0];
        expenseAssignments.forEach(expenseAssignment => {
          if (expenseAssignment && expenseAssignment.expense) {
            this.data.push(new ExpenseAssignView(expenseAssignment));
          }
        });
        // rescatamos propiedades
        this.properties = res[1];
        // rescatamos propiedades auxiliar
        this.propertiesAux = this.properties;
        // rescatamos los sectores
        this.sectors = res[2];
        if (this.sectors) {
          this.sectorSelected = this.sectors[0];
        }
        // rescatamos periodos
        this.periods = res[3];
        if (this.periods) {
          this.periodSelected = this.periods[0];
        }
        // rescatamos fondos
        this.funds = res[4];
        // rescatamos metodos de calculo
        this.methods = res[5];
        if (this.methods) {
          this.methodSelected = this.methods.find(m => m.slug === 'PROPERTY_DIVISION');
        }
        // rescatamos categias de recargo
        this.categories = res[6].json();
        if (this.categories) {
          this.categorySelected = this.categories[0].id;
        }

        this.resetProperties();
        this.filters();
      }, error => {
        this.isUploading = false;
      });
  }

  // contiene la logica de DATOS DE RECARGO
  public filters(): void {
    // **********************
    this.resetAssignments();
    // **********************
    // init - filtro sector
    const sector = this.sectorSelected;
    const list = [];
    this.properties = [];
    this.properties = this.propertiesAux.filter(property => {
      let cont = 0;
      property.units.forEach(unit => {
        return unit.sectors.filter(sec => {
          if (sec.slug === this.sectorSelected.slug) {
            cont = cont + 1;
          }
        });
      });
      if (cont > 0) {
        list.push(property);
      }
    });
    this.properties = list;
    // end - filtro sector
    // init - filtro metodo
    const includeProperties = this.properties.filter(p => p.state === true);
    this.expenseAmountSelected = 0;
    if (this.methodSelected.slug === 'PROPERTY_DIVISION') {
      this.expenseAmountSelected = this.expenseAmountSelectedAux;
    }
    includeProperties.forEach(prop => {
      this.includeCalculate(prop);
    });
    // end - filtro metodo
  }

  public showChildModal(): void {
    this.confirmationChangeExpense.show();
  }

  public hideChildModal(): void {
    this.expenseSelectedModal.state = false;
    this.confirmationChangeExpense.hide();
  }

  // se ejecuta al cambiar gasto activo
  public changeAssign(expenseSelected: ExpenseAssign): void {
    this.expenseSelectedModal = expenseSelected;
    if (expenseSelected.state) {
      this.formAssignment['controls'].expense.setValue(expenseSelected);
      const changeExpense = this.data.filter(d => d.state === true).length;
      if (changeExpense > 1) {
        const assignment = this.formAssignment.value.surcharge_property.length;
        if (assignment > 0) {
          this.showChildModal();
          // alert('esta cambiando de gasto, perderá asignaciones realizadas!.');
        } else {
          this.renderNewExpense(expenseSelected);
        }
      } else {
        this.renderNewExpense(expenseSelected);
      }
    } else {
      this.formAssignment['controls'].expense.setValue(null);
      this.showProperties = false;
      this.resetProperties();
    }
  }

  // confirmamos cambio de gasto
  public renderNewExpense(expenseSelected: ExpenseAssign): void {
    // **********************
    this.resetAssignments();
    // **********************
    this.data.forEach(expense => {
      expense.state = false;
    });
    const exp = this.data.find(e => e.id === expenseSelected.id);
    if (this.methodSelected.slug === 'PROPERTY_DIVISION') {
      this.expenseAmountSelected = (+exp.amount);
    } else if (this.methodSelected.slug === 'PRORRATE') {
      this.expenseAmountSelected = 0;
    }
    this.expenseAmountSelectedAux = (+exp.amount);
    this.expenseSelected = exp;
    exp.state = true;
    this.showProperties = true;
    this.resetProperties();
    this.checkAllSwitch = false;
  }

  // seleccionamos o deseleccionamos todos los inmubles
  public checkedAll(): void {
    if (this.checkAllSwitch) {
      this.properties.forEach(property => {
        property.state = true;
      });
    } else {
      this.properties.forEach(property => {
        property.state = false;
        property.amount = 0;
      });
    }
    this.filters();
  }

  // calculamos montos para asignaciones activas
  public includeCalculate(property: any, view: Boolean = false): void {
    const includeProperties = this.properties.filter(p => p.state === true);
    let expenseAmount;
    if (this.methodSelected.slug === 'PROPERTY_DIVISION') {
      expenseAmount = Math.round(this.expenseAmountSelectedAux / includeProperties.length);
      const difference = expenseAmount * includeProperties.length;
      this.expenseAmountSelectedLast = 0;
      if (difference !== this.expenseAmountSelectedAux) {
        this.expenseAmountSelectedLast = (this.expenseAmountSelectedAux - difference);
      }

      if (view) {
        // **********************
        this.resetAssignments();
        // **********************
        includeProperties.forEach((prop, _i) => {
          if (this.expenseAmountSelectedLast !== 0 && _i === (includeProperties.length - 1)) {
            prop.amount = expenseAmount + this.expenseAmountSelectedLast;
          } else {
            prop.amount = expenseAmount
          }
          this.addAssignment(prop);
        });
      } else {
        if (includeProperties.length > 0) {
          const _lastIndex = (includeProperties.length - 1);
          const _indexAssign = includeProperties.indexOf(property);
          if (_indexAssign === _lastIndex) {
            property.amount = expenseAmount + this.expenseAmountSelectedLast;
          } else {
            property.amount = expenseAmount
          }
          this.addAssignment(property);
        }
      }
    }
    if (this.methodSelected.slug === 'PRORRATE' && property.state) {
      this.proportionAssignments();
      this.addAssignment(property);
    } else if (this.methodSelected.slug === 'PRORRATE' && !property.state) {
      property.factors[0].recalculated = 0;
      this.proportionAssignments();
      const assigmentsForm = this.formAssignment.value.surcharge_property;
      const _index = assigmentsForm.findIndex(p => p.id_property === property.id);
      this.removeAssignment(_index);
    }

    if (!property.state) {
      property.amount = 0;
    }

    // manejamos switch principal al manejar asignaciones a inmubles individualmente
    if (includeProperties.length === this.properties.length) {
      this.checkAllSwitch = true;
    } else {
      this.checkAllSwitch = false;
    }

    this._helpersService.sortListProperties(this.properties);
  }

  // calcula proporción de cada inmueble según su porcentaje de prorrateo
  public proportionAssignments(): void {
    let expenseAmount;
    const propertiesList = this.properties.filter(p => p.state === true);

    this.proportion = 0;
    propertiesList.forEach(prop => {
      if (prop.state) {
        this.proportion = parseFloat(parseFloat(this.proportion).toFixed(2)) + parseFloat(parseFloat(prop.factors[0].factor.toString()).toFixed(2));
        this.proportion = parseFloat(parseFloat(this.proportion).toFixed(2));
      } else {
        prop.factors[0].recalculated = 0;
      }
    });

    this.expenseAmountSelected = 0;
    propertiesList.forEach(prop => {
      if (prop.state) {
        const porcentProperty = ((parseFloat(parseFloat(prop.factors[0].factor.toString()).toFixed(2)) / this.proportion) * this.expenseAmountSelectedAux);
        prop.factors[0].recalculated = ((parseFloat(parseFloat(prop.factors[0].factor.toString()).toFixed(2)) / this.proportion) * 100);
        expenseAmount = Math.round(porcentProperty);
        prop.amount = expenseAmount;
        this.expenseAmountSelected = this.expenseAmountSelected + prop.amount;
        const _index = this.formAssignment.value.surcharge_property.findIndex(p => p.id_property === prop.id);
        if (_index !== -1) {
          this.formAssignment['controls'].surcharge_property['controls'][_index]['controls'].amount_surcharge.setValue(prop.amount);
        }
      }

      if (this.expenseAmountSelected > this.expenseAmountSelectedAux) {
        const difference = this.expenseAmountSelected - this.expenseAmountSelectedAux;
        const lastItem = propertiesList[propertiesList.length - 1];
        this.expenseAmountSelected = this.expenseAmountSelected - lastItem.amount;
        lastItem.amount = lastItem.amount - difference;
        this.expenseAmountSelected = this.expenseAmountSelected + lastItem.amount;
      }
    });
  }

  // actualiza cambios en monto de asignación
  public changeAmountAssign(property: any): void {
    const assigmentsForm = this.formAssignment.value.surcharge_property;
    const _index = assigmentsForm.findIndex(p => p.id_property === property.id);
    if (_index !== -1) {
      this.formAssignment['controls'].surcharge_property['controls'][_index]['controls'].amount_surcharge.setValue(property.amount);
    }
    let amountAssign = 0;
    this.formAssignment['controls'].surcharge_property.value.forEach(assign => {
      amountAssign = amountAssign + assign.amount_surcharge;
    });
    this.expenseAmountSelected = amountAssign;
    const amountExpense = this.expenseAmountSelectedAux;
    if (amountAssign > amountExpense) {
      this.formAmountAssignments = true;
      this._translateService.get(['EXPENSE.EXPENSE_ASSIGNMENTS_PROPERTIES.NOTIFICATION.WARNING', 'EXPENSE.EXPENSE_ASSIGNMENTS_PROPERTIES.NOTIFICATION.AMOUNT_INVALID'])
        .takeUntil(this.componentDestroyed)
        .subscribe((translation: string) => {
          this._toasterService.pop('warning',
            translation['EXPENSE.EXPENSE_ASSIGNMENTS_PROPERTIES.NOTIFICATION.WARNING'], translation['EXPENSE.EXPENSE_ASSIGNMENTS_PROPERTIES.NOTIFICATION.AMOUNT_INVALID']);
        });
    } else {
      this.formAssignment['controls'].difference['controls'].amountDifference.setValue(null);
      this.formAssignment['controls'].difference['controls'].fund.setValue(null);
      this.formAssignment['controls'].difference['controls'].account.setValue(null);
      this.formAmountAssignments = false;

    }
  }

  // resetea inmuebles en vista
  public resetProperties(): void {
    this.properties.forEach(property => {
      property.state = false;
      property.amount = 0;
    });
  }

  // resetea asignaciones en formulario
  public resetAssignments(): void {
    // init - limpiamos formulario con asignaciones al cambiar de metodo
    if (this.formAssignment.value.surcharge_property) {
      this.formAssignment.value.surcharge_property.forEach((assignment, _i) => {
        this.removeAssignment((this.formAssignment.value.surcharge_property.length - 1) - _i);
      });
    }
    // end  - limpiamos formulario con asignaciones al cambiar de metodo
  }

  // eliminamos asignación de formulario
  removeAssignment(i: number) {
    const ctrl = <FormArray>this.formAssignment.controls['surcharge_property'];
    ctrl.removeAt(i);
  }

  // añadir asignación a formulario
  addAssignment(property: any) {
    const control = <FormArray>this.formAssignment.controls['surcharge_property'];
    const addrCtrl = this.initAssignmentProperty(property);
    control.push(addrCtrl);
  }

  // inicializacion object asignación
  initAssignmentProperty(property: any) {
    return this._fb.group({
      id_property: property.id,
      amount_surcharge: property.amount,
      name_property: property.name
    });
  }

  // valida diferencias entre asignaciones y monto de gasto y
  // levanta modal en el caso que se deba asignar diferencia a fondo o cuenta
  public validateAmountAssign(formAssignProperties: any, template: TemplateRef<any>): void {
    this.showFundsAssign = false;
    this.radioType = null;
    let amountAssignments = 0;
    formAssignProperties.surcharge_property.forEach(assign => {
      amountAssignments = amountAssignments + assign.amount_surcharge;
    });
    if (this.methodSelected.slug === 'PROPERTY_DIVISION') {
      if ((+formAssignProperties.expense.amount) !== amountAssignments) {
        this.formAssignment['controls'].difference['controls'].amountDifference.setValue((+formAssignProperties.expense.amount) - amountAssignments);
        this.differenceNotification.value = `${this.expenseSelected.expense.expense_type.code}${this.expenseSelected.expense.code}`;
        this.differenceNotification.value2 = (+formAssignProperties.expense.amount) - amountAssignments;
        this.confirmBalanceAssignment.show();
      } else {
        this.formAssignment['controls'].difference['controls'].amountDifference.setValue(null);
        this.formAssignment['controls'].difference['controls'].fund.setValue(null);
        this.formAssignment['controls'].difference['controls'].account.setValue(null);
        formAssignProperties = this.formAssignment.value;
        this.saveAssignmentsProperties(formAssignProperties);
      }
    } else if (this.methodSelected.slug === 'PRORRATE') {
      if ((+formAssignProperties.expense.amount) !== amountAssignments) {
        this.formAssignment['controls'].difference['controls'].amountDifference.setValue((+formAssignProperties.expense.amount) - amountAssignments);
        this.differenceNotification.value = `${this.expenseSelected.expense.expense_type.code}${this.expenseSelected.expense.code}`;
        this.differenceNotification.value2 = (+formAssignProperties.expense.amount) - amountAssignments;
        this.confirmBalanceAssignment.show();
      } else {
        this.formAssignment['controls'].difference['controls'].amountDifference.setValue(null);
        this.formAssignment['controls'].difference['controls'].fund.setValue(null);
        this.formAssignment['controls'].difference['controls'].account.setValue(null);
        formAssignProperties = this.formAssignment.value;
        this.saveAssignmentsProperties(formAssignProperties);
      }
    }
  }

  // se ejecuta al seleccionar cuenta o fundo a asignar diferencia
  public differenceAssign(type: string): void {
    if (type === 'account') {
      this.showFundsAssign = false;
      this.formAssignment['controls'].difference['controls'].account.setValue(true);
      this.formAssignment['controls'].difference['controls'].fund.setValue(null);
    }
    if (type === 'fund') {
      this.formAssignment['controls'].difference['controls'].account.setValue(null);
      this.showFundsAssign = true;
    }
    if (type === 'manual') {
      this.showFundsAssign = false;
      this.formAssignment['controls'].difference['controls'].account.setValue(null);
      this.formAssignment['controls'].difference['controls'].fund.setValue(null);
      this.confirmBalanceAssignment.hide();
    }
  }

  // se ejecuta al seleccionar fondo al cual se irá diferencia restante entre
  // monto de gasto y totoal de asignaciones
  public differenceAssignFund(fund: Fund): void {
    this.formAssignment['controls'].difference['controls'].fund.setValue(fund);
  }

  // enviamos datos a API
  public saveAssignmentsProperties(formAssignProperties: any): void {
    this.isUploading = true;
    this.showProperties = false;
    formAssignProperties.expense.expense.assignment_id = formAssignProperties.expense.id;
    this._expenseService.postExpenseAssignProperties(formAssignProperties, this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
      response => {
        this.isUploading = false;
        const _indexRemove = this.data.indexOf(this.expenseSelected);
        this.data.splice(_indexRemove, 1);
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            this._toasterService.pop('success',
              translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
          });
      },
      error => {
        this.isUploading = false;
        this.showProperties = true;
        const messageKey = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
        this._translateService.get(['GENERAL.ERROR_TITLE', messageKey])
          .subscribe((res: string) => {
            this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[messageKey]);
          });
      });
  }

}
