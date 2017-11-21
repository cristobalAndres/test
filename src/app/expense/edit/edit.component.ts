import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { toasterConfig } from '../../app.config';

import * as moment from 'moment/moment'

// Sevices
import { ExpenseService } from '../expense.service';
import { SectorService } from '../../services/sector.service';
import { SettingsService } from '../../services/settings.service';
import { AccoutingAccountService } from '../../services/accouting-account.service';

// Models
import { Expense } from '../../models/expense.model'
import { Sector } from '../../models/sector.model'

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})

export class EditComponent implements OnInit, OnDestroy {

  communityId: number;
  formExpenseEdit: FormGroup;
  expenseId: number;
  expense: Expense;
  sectors: Sector[];
  supcription: Subscription;
  componentDestroyed: Subject<boolean> = new Subject();
  elementView: Boolean = true;
  edit: Boolean = true;
  titleAssignmets: string;
  validForm: Boolean = false;
  statePeriod: Boolean = false;
  isUploading: Boolean;
  periodInitSetting: string;
  periodCurrentSetting: string;

  constructor(private _fb: FormBuilder,
              private _route: ActivatedRoute,
              private _expenseService: ExpenseService,
              private _sectorService: SectorService,
              private _translateService: TranslateService,
              private _accoutingAccountService: AccoutingAccountService,
              private _toasterService: ToasterService,
              private _settingService: SettingsService) {
    this._translateService.get(['EXPENSE.ASSIGN.PLURAL'])
      .takeUntil(this.componentDestroyed)
      .subscribe((translation: string) => {
        this.titleAssignmets = translation['EXPENSE.ASSIGN.PLURAL'];
      });
  }

  ngOnInit() {
    this.startForm();
    this.communityId = +localStorage.getItem('communityId');
    this.supcription = this._route.params.subscribe(params => {
      this.expenseId = +params['id']; // (+) converts string 'id' to a number
      this.getData();
    });
  }

  ngOnDestroy() {
    this.supcription.unsubscribe();
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  // iniciamos Formulario Edición Expense
  public startForm(): void {
    this.formExpenseEdit = this._fb.group({
      expense: this._fb.array([])
    });
  }

  // traemos data expense seleccionado
  public getData(): void {
    this.isUploading = true;
    const getExpenseById = this._expenseService.getExpenseById(this.communityId, this.expenseId);
    const getSectors = this._sectorService.getAll(this.communityId);
    const getSettings = this._settingService.getSettings(this.communityId);
    Observable.forkJoin(
      getExpenseById,
      getSectors.map(sectors => sectors.json() as Sector[]),
      getSettings)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          // rescatamos data de Gasto
          this.expense = data[0].json();
          // rescatamos data de sectores necesarios apra funcionamiento de cuotas
          this.sectors = data[1];
          // recuperamos parametros de configuración para comunidad - periodo de inicio
          this.periodInitSetting = ((data[2].json().find(p => p.community_settings_field.key === 'COMMUNITY_FIRTS_PERIOD')).value).replace('-', '');
          // recuperamos parametros de configuración para comunidad - periodo actual
          this.periodCurrentSetting = ((data[2].json().find(p => p.community_settings_field.key === 'COMMUNITY_CURRENT_PERIOD')).value);
          // si existen datos de gasto poblamos formulario de edición
          if (this.expense) {
            let listSectors;
            this.expense.expense_assignments.forEach(assignment => {
              assignment.expense_fees.forEach(fee => {
                listSectors = [];
                this.sectors.forEach(sector => {
                  const sectorOrder = fee.expense_fee_sectors.find(s => s.sector_id === sector.id);
                  listSectors.push(sectorOrder);
                });
                fee.expense_fee_sectors = [];
                fee.expense_fee_sectors = listSectors;
              });
            });
            this.startExpenseEdit(this.expense);
          }
          this.isUploading = false;
        },
        error => {
          // Error
          this.isUploading = false;
        },
        () => {
          // Complete
          this.isUploading = false;
        });
  }

  // añadir objeto dinamico al formulario
  public startExpenseEdit(expense: Expense): void {
    const control = <FormArray>this.formExpenseEdit.controls['expense'];
    const addCtrl = this.creationExpenseToEdit(expense);
    control.push(addCtrl);
    this.mappingAssignments(this.expense);
  }

  // inicializacion object Expense a Editar
  public creationExpenseToEdit(expense: Expense): FormGroup {
    return this._fb.group({
      code: [expense.code, Validators.required],
      expense_type_id: [expense.expense_type_id, Validators.required],
      expense_type: [expense.expense_type],
      type: {id: expense.expense_type_id},
      date: [moment(expense.date).format('YYYY-MM-DD hh:mm'), Validators.required],
      expiration_date: expense.expiration_date ? moment(expense.expiration_date).format('YYYY-MM-DD hh:mm') : null,
      amount: (+expense.amount),
      amount_origin: (+expense.amount),
      assign: true,
      description: [expense.description, Validators.required],
      accountingAccount: [expense.expense_type_id],
      subAccountingAccount: [expense.expense_type_id],
      supplier_id: [expense.supplier_id, Validators.required],
      supplier: {id: expense.supplier_id},
      supplier_name: expense.supplier_name,
      feesCount: [expense.expense_assignments.length],
      expense_assignments: this._fb.array([]),
      expenseState: expense.expenseState,
      assignIdDeferred: expense.expense_assignments.find(a => a.expense_fees.length === 0) ? expense.expense_assignments.find(a => a.expense_fees.length === 0).id : null
    });
  }

  public mappingAssignments(expense: Expense): void {
    const state = expense.expense_assignments.some(search => {
      if (search.expense_assignment_type) {
        return search.expense_assignment_type.slug !== 'GASTO_COMUN';
      } else {
        return search.expense_assignment_type === null;
      }
    });

    if (!state) {
      console.log('gasto con asignaciones de tipo distribución o a inmubles!!!');
      expense.expense_assignments.forEach(assign => {
        if (assign.expense_fees.length > 0) {
          this.addAssign(assign);
        }
      });
    }
  }

  public refreshForm(): void {
    this.startExpenseEdit(this.expense);
  }

  // añadir objeto dinamico al formulario
  addAssign(assign: any) {
    const control = <FormArray>this.formExpenseEdit.controls['expense']['controls'][0].controls['expense_assignments'];
    const getSettings = this._accoutingAccountService.getAccountAssignment(assign.id)
      .subscribe(assigment => {
        const accunting = assigment.json();
        assign.account_id = accunting.account_id;
        assign.account_primary_id = accunting.account.parent_id;
        const addrCtrl = this.initAssign(assign);
        assign.expense_fees.forEach((fee, index) => {
          this.addFees(fee, addrCtrl);
        });
        control.push(addrCtrl)
      });
  }

  initAssign(assign: any) {
    return this._fb.group({
      amount: [(+assign.amount), Validators.required],
      amountAssign: (+assign.amount),
      account_id: [assign.account_id, Validators.required], // falta que venga en servicio la información de la cuetna de cada asignación
      account_primary_id: [assign.account_primary_id, Validators.required], // falta que venga en servicio la información de la cuetna de cada asignación
      expense_assignment_type_id: assign.expense_assignment_type ? assign.expense_assignment_type : null,
      expense_fees: this._fb.array([]),
      feesCount: assign.expense_fees.length,
      expense_fee_ids: this._fb.array(this.expenseCountFeeEdit(assign)),
      id: assign.id
    });
  }

  public expenseCountFeeEdit(assign): number[] {
    const listFeeBlock = [];
    assign.expense_fees.forEach(fee => {
      if (fee.periodState === true) {
        listFeeBlock.push(fee.id);
      }
    });
    return listFeeBlock;
  }

  // agregamos FEE a asignación
  addFees(fee: any, form: FormGroup) {
    const control = <FormArray>form.controls['expense_fees'];
    const addrCtrl = this.initFees(fee, form.controls['id'].value);

    fee.expense_fee_sectors.forEach((sector, index) => {
      this.addSector(sector, addrCtrl);
    });
    control.push(addrCtrl);
  }

  // creación objeto FEE
  initFees(fee: any, assignmentId: number) {
    return this._fb.group({
      amount: [(+fee.amount), Validators.required],
      description: fee.description,
      number: 1,
      period: (+fee.period),
      expense_fee_sectors: this._fb.array([]),
      porcent: ((fee.amount / (+this.formExpenseEdit.controls['expense']['controls'][0].controls['amount'].value)) * 100),
      code: null,
      id: new FormControl(fee.id),
      position: null,
      periodState: fee.periodState,
      expense_assignment_id: assignmentId,
    });
  }

  // inicializacion object dinamico
  initSectors(sector: any) {
    return this._fb.group({
      id: sector.id,
      sector_id: sector.sector_id,
      name: null,
      active: null,
      slug: null,
      amount: (+sector.amount)
    });
  }

  // añadir objeto dinamico al formulario
  addSector(sector: Sector, form: FormGroup) {
    const control = <FormArray>form.controls['expense_fee_sectors'];
    const addrCtrl = this.initSectors(sector);
    control.push(addrCtrl);
  }

  public expenseSaveEdit(formExpense: any): void {
    this.isUploading = true;
    const dataToSubmit = {
      expense: formExpense.expense[0],
    };
    if (dataToSubmit.expense.date) {
      dataToSubmit.expense.date = moment(dataToSubmit.expense.date).format();
    }
    if (dataToSubmit.expense.expiration_date !== '' && dataToSubmit.expense.expiration_date !== null) {
      dataToSubmit.expense.expiration_date = moment(dataToSubmit.expense.expiration_date).format();
    } else {
      dataToSubmit.expense.expiration_date = null;
    }

    dataToSubmit.expense.expense_assignments.forEach(assignment => {
      assignment.amount = assignment.amountAssign;
    });

    this._expenseService.putExpense(this.communityId, this.expenseId, dataToSubmit)
      .takeUntil(this.componentDestroyed)
      .subscribe(response => {
          // Success
          this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this._toasterService.pop('success',
                translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
            });
          this.isUploading = false;
        },
        error => {
          this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
            .takeUntil(this.componentDestroyed)
            .subscribe((translation: string) => {
              this._toasterService.pop('error',
                translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
            });
          this.isUploading = false;
        });
  }

  // ouput desde componente sectors
  ouputFormValid(estadoForm): void {
    this.validForm = this._expenseService.detectStatus(this.formExpenseEdit.value.expense, this._expenseService.validateAmountsSectors(this.formExpenseEdit.value.expense), this.statePeriod);
  }

  // ouput desde componente fees
  ouputFormValidFee(estadoForm): void {
    this.validForm = this._expenseService.detectStatus(this.formExpenseEdit.value.expense, this._expenseService.validateAmountsSectors(this.formExpenseEdit.value.expense), this.statePeriod);
  }

  // ouput periodo desde fees
  ouputPeriodSelected(state): void {
    this.statePeriod = state;
    this.validForm = this._expenseService.detectStatus(this.formExpenseEdit.value.expense, this._expenseService.validateAmountsSectors(this.formExpenseEdit.value.expense), this.statePeriod);
  }
}
