import { ExpenseType } from './expense-type.model';
import { Supplier } from './supplier.model';

import * as moment from 'moment/moment'

export class Expense {
  id?: number;
  code?: string;
  date?: string = '';
  created_at?: string = '';
  updated_at?: string = '';
  deleted_at?: string = '';
  expiration_date?: string = '';
  amount?: number;
  description?: string;
  supplier_id?: number;
  supplier_name: string;
  community_id?: number;
  expense_type_id?: number;
  expense_type?: ExpenseType;
  supplier?: Supplier;
  expense_assignments?: any[];
  outcomes?: OutCome;
  expenseState?: boolean;
  removable?: boolean;
  unassignable?: boolean;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class OutCome {
  payment: string;
  paymentDocument: any = [];
  departureNumber: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class ExpenseListView {
  id?: number;
  amount?: number;
  code: string;
  supplier: Supplier;
  expense_assignments?: any;
  expense_assignment_type?: any;
  outcomes: any;
  // for view
  expense_type_name?: string;
  expense_type_code?: string;
  expense_code?: string;
  expense_supplier_name?: string;
  expense_description?: string;
  expense_amount?: number;
  expense_date?: string;
  expense_period?: any;
  removable?: boolean;
  unassignable?: boolean;

  constructor(expense: Expense) {
    this.parse(expense);
  }

  parse(expense: Expense): void {
    this.id = expense.id ? expense.id : null;
    this.amount = expense.amount ? expense.amount : null;
    this.code = expense.code ? expense.code : null;

    this.expense_supplier_name = expense.supplier.name ? expense.supplier.name : null;
    this.expense_type_name = expense.expense_type.name ? expense.expense_type.name : null;
    this.expense_type_code = expense.expense_type.code ? expense.expense_type.code : null;
    this.expense_code = expense.code ? expense.code : null;
    this.expense_description = expense.description ? expense.description : null;
    this.expense_amount = expense.amount ? expense.amount : null;
    this.expense_date = expense.date ? moment(expense.date).format('DD-MM-YYYY') : null;
    this.expense_period = expense.expense_assignments ? this.periods(expense.expense_assignments, 'assignments') : null;
    this.expense_assignments = expense.expense_assignments ? expense.expense_assignments : null;
    this.expense_assignment_type = expense.expense_assignments ? this.periods(expense.expense_assignments, 'assignments_types') : null
    this.supplier = expense.supplier ? expense.supplier : null;
    this.outcomes = expense.outcomes ? this.customPayments(expense.outcomes) : null;
    this.removable = expense.removable ? expense.removable : false;
    this.unassignable = expense.unassignable ? expense.unassignable : false;
  }

  private customPayments(outcomes: any) {
    const listData = [];
    if (outcomes) {
      outcomes.forEach((outcome_metadata, index) => {
        outcome_metadata.outcome_metadata.forEach(outcome => {
          const objectOutCome = new OutCome();
          switch (true) {
            case outcome.outcome_field.name === 'CUENTA_BANCARIA': {
              objectOutCome.payment = `${outcome.outcome_field.name} ${outcome_metadata.bank_accounts[index].bank.name}`;
              const search = outcome_metadata.outcome_metadata.find(o => o.outcome_field.key === 'TIPO_VOUCHER');
              objectOutCome.departureNumber = `${search.outcome_field.name} ${search.id}`;
              listData.push(objectOutCome);
              break;
            }
            case outcome.outcome_field.name === 'CHEQUE': {
              objectOutCome.payment = `${outcome.outcome_field.name} ${outcome_metadata.checks[index].checkbook.bank_account.bank.name}`;
              objectOutCome.paymentDocument.push(outcome_metadata.checks);
              const search = outcome_metadata.outcome_metadata.find(o => o.outcome_field.key === 'TIPO_VOUCHER');
              objectOutCome.departureNumber = `${search.outcome_field.name} ${search.id}`;
              listData.push(objectOutCome);
              break;
            }
          }
        });
      });
      return listData;
    }
  }


  private periods(assignments: any, type: string) {
    if (type === 'assignments') {
      const listFees = [];
      assignments.forEach(assignmet => {
        let descriptionFee = '';
        assignmet.expense_fees.forEach(fee => {
          descriptionFee = `${descriptionFee}${fee.description}`;
        });
        listFees.push(descriptionFee);
      });
      return listFees.toString();
    }
    if (type === 'assignments_types') {
      const listAssignmetType = [];
      assignments.forEach(assignmet => {
        let descriptionFee = '';
        descriptionFee = assignmet.expense_assignment_type ? `${descriptionFee}${assignmet.expense_assignment_type.name}` : descriptionFee;
        listAssignmetType.push(descriptionFee);
      });
      return listAssignmetType.toString();
    }
  }
}



