import { ExpenseType } from './expense-type.model';
import { Expense } from './expense.model';
import { Supplier } from './supplier.model';

export class ExpenseAssign {
  id?: number;
  expense?: Expense;
  amount?: number;
  state?: Boolean = false;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class ExpenseAssignService {
  expense_id: number;
  expense_assignment_id: number;
  doc: string;
  description: string;
  supplier_name: string;
  amount: number;
  expense_total: number;
  percentage: number;
}

export class ExpenseAssignView {
  id?: number;
  expense?: Expense;
  amount?: number;
  state?: Boolean = false;
  // for view
  expense_type_name?: string;
  expense_type_code?: string;
  expense_code?: string;
  expense_supplier_name?: string;
  expense_description?: string;
  expense_amount?: number;

  constructor(expenseAssign: ExpenseAssign) {
    this.parse(expenseAssign);
  }

  parse(expenseAssign: ExpenseAssign): void {
    if (expenseAssign.expense) {
      this.id = expenseAssign.id ? expenseAssign.id : null;
      this.expense = expenseAssign.expense ? expenseAssign.expense : null;
      this.amount = expenseAssign.amount ? expenseAssign.amount : null;
      this.state = expenseAssign.state ? expenseAssign.state : null;
      this.expense_type_name = expenseAssign.expense.expense_type.name ? expenseAssign.expense.expense_type.name : null;
      this.expense_type_code = expenseAssign.expense.expense_type.code ? expenseAssign.expense.expense_type.code : null;
      this.expense_code = expenseAssign.expense.code ? expenseAssign.expense.code : null;
      this.expense_supplier_name = expenseAssign.expense.supplier.name ? expenseAssign.expense.supplier.name : null;
      this.expense_description = expenseAssign.expense.description ? expenseAssign.expense.description : null;
      this.expense_amount = expenseAssign.expense.amount ? expenseAssign.expense.amount : null;
    }
  }
}

