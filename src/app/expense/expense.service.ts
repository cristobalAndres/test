import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService, BASE_URL_CRUD } from '../app.service';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ExpenseService extends AppService {

  // Observable
  _notificationRender = new BehaviorSubject<[Boolean, number]>([false, 1]);
  _notificationRenderFee$ = this._notificationRender.asObservable();

  // Observable validar montos de formulario
  _notificationStartEvaluation = new BehaviorSubject<Boolean>(false);
  _notificationStartEvaluation$ = this._notificationStartEvaluation.asObservable();

  // actualizamos cuotas
  updateObservable(state: Boolean, count: number) {
    this._notificationRender.next([state, count]);
  }

  // indicamos inicio a evaluación de montos gastos
  startEvaluationOfExpenses(state: Boolean) {
    this._notificationStartEvaluation.next(state);
  }

  constructor(http: Http) {
    super(http);
  }

  getExpenseById(community: number, expenseId: number) {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/expense/${expenseId}`;
    return this.get(this.endpoint);
  }

  getAllExpenses(community: number, periodId: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/common-expenses/communities/${community}/period/${periodId}`;
    return this.get(this.endpoint);
  }

  getAllExpensesFilter(community: number, periodId: number = null, date: string = null, expiration_date: string = null, expanse_type: number = null, assign_id: number = null): Observable<Response> {
    const baseurl = `${BASE_URL_CRUD}/expense/communities/${community}/search`;
    let query = '';
    const queryArray = [];
    if (periodId) {
      queryArray.push(`period=${periodId}`);
    }
    if (date) {
      queryArray.push(`dateFrom=${date}`);
    }
    if (expiration_date) {
      queryArray.push(`dateTo=${expiration_date}`);
    }
    if (expanse_type) {
      queryArray.push(`expenseType=${expanse_type}`);
    }
    if (assign_id) {
      queryArray.push(`assign=${assign_id}`);
    }
    if (queryArray.length > 0) {
      query = queryArray.join('&');
    }
    this.endpoint = `${baseurl}?${query}`;
    return this.get(this.endpoint);
  }

  allAssign(community: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/deferred-expenses`;
    return this.get(this.endpoint);
  }

  postExpense(expenses: any, community: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/expenses/create`;
    return this.create(this.endpoint, expenses);
  }

  postExpenseAssign(expenses: any, community: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/expenses/assign`;
    return this.create(this.endpoint, expenses);
  }

  // guardar asignaciones
  postExpenseAssignProperties(assignProperties: any, community: number): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/surcharge/create`;
    return this.create(this.endpoint, assignProperties);
  }

  putExpense(community: number, expenseId: number, expenseUpdate: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/expense/edit/${expenseId}`;
    return this.patch(this.endpoint, expenseUpdate);
  }

  postExpenseUnassign(community: number, listExpense: any): Observable<Response> {
    this.endpoint = `${BASE_URL_CRUD}/expenses/communities/${community}/unassign`;
    return this.create(this.endpoint, listExpense);
  }

  deleteExpenseById(community: number, expenseId: number) {
    this.endpoint = `${BASE_URL_CRUD}/communities/${community}/expenses/${expenseId}`;
    return this.remove(this.endpoint);
  }


  unassignConsumerServices(community: number, expenseId: number) {
    const data: any = {};
    data.id = expenseId;
    console.log('expenseId : ', data);
    this.endpoint = `${BASE_URL_CRUD}/expenses/communities/${community}/consumer-service/unassign`;
    return this.create(this.endpoint, data);
  }

  // validamos montos de sectores para su correcto envío a API
  validateAmountsSectors(expenses: any): Boolean {
    let amountSectors = 0;
    let amountExpense = 0;
    let ampountFee = 0;
    let state = false;
    expenses.forEach(expense => {
      amountExpense = expense.amount;
      const porcentExpense = expense.porcentExpense;
      expense.expense_assignments.forEach(expenseAssign => {
        expenseAssign.expense_fees.forEach(fee => {
          if (fee.expense_fee_sectors.length > 0) {
            ampountFee = fee.amount;
            amountSectors = 0;
            fee.expense_fee_sectors.forEach(sector => {
              amountSectors = amountSectors + sector.amount;
            });
            if (amountSectors > ampountFee || amountSectors < ampountFee) {
              state = true;
            }
          }
        });
      });
    });
    return state;
  }

  // validamos montos de cuotas(fee) para su correcto envío a API
  validateAmountsFees(expenses: any, slug: Boolean = false): Boolean {
    let amountFees = 0;
    let amountExpense = 0;
    let state = false;
    expenses.forEach(expense => {
      expense.expense_assignments.forEach(expenseAssign => {
        amountExpense = expenseAssign.amount;
        amountFees = 0;
        expenseAssign.expense_fees.forEach(fee => {
          amountFees = amountFees + fee.amount;
        });
        if (slug === true) {
          if (amountFees > amountExpense || amountFees < amountExpense) {
            state = true;
          }
        } else {
          if (expenseAssign.amountAssign) {  // validación exclusiva para edición gasto en el caso que los montos de las cuotas sean diferentes al monto de la asignación
            if ((+expenseAssign.amountAssign) !== amountFees) {
              state = true;
            }
          }
          if (!expenseAssign.amountAssign && amountFees > amountExpense) {
            state = true;
          }
        }
      });
    });
    return state;
  }

  // evaluamos el estado de los 3 criterios externos para deshabilitar formulario principal
  detectStatus(expenses: any, sectorStatus: Boolean, statePeriod: Boolean) {
    const stateFees = this.validateAmountsFees(expenses);
    if (statePeriod === true || stateFees === true || sectorStatus === true) {
      return true;
    } else {
      return false;
    }
  }
}
