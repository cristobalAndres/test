import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Layouts
import { FullLayoutComponent } from './layouts/full-layout.component';
import { BlankLayoutComponent } from './layouts/blank-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: FullLayoutComponent,
    data: {
      title: 'HOME'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: './dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'community',
        loadChildren: './community/community.module#CommunityModule'
      },
      {
        path: 'community-import',
        loadChildren: './community-import/import.module#CommunityImportModule'
      },
      {
        path: 'initial-balance',
        loadChildren: './initial-balance/import.module#InitialBalanceImportModule'
      },
      {
        path: 'community-units',
        loadChildren: './community-units/community-units.module#CommunityUnitsModule'
      },
      {
        path: 'fund',
        loadChildren: './fund/fund.module#FundModule'
      },
      {
        path: 'property',
        loadChildren: './property/property.module#PropertyModule',
      },
      {
        path: 'property/:id/payment/create',
        loadChildren: './payment/bill/bill.module#BillModule'
      },
      {
        path: 'bank',
        loadChildren: './bank/bank.module#BankModule'
      },
      {
        path: 'expense',
        loadChildren: './expense/expense.module#ExpenseModule'
      },
      {
        path: 'common-expenses',
        loadChildren: './common-expenses/common-expenses.module#CommonExpensesModule'
      },
      {
        path: 'transactions',
        loadChildren: './transaction/transaction.module#TransactionModule'
      },
      {
        path: 'payment',
        loadChildren: './payment/payment.module#PaymentModule'
      },
      {
        path: 'setting',
        loadChildren: './setting/setting.module#SettingModule'
      },
      {
        path: 'surcharge',
        loadChildren: './surcharge/surcharge.module#SurchargeModule'
      },
      {
        path: 'accounting-account',
        loadChildren: './accounting/accounting.module#AccountingAccountModule'
      },
      {
        path: 'financial-state',
        loadChildren: './financial-state/financial-state.module#FinancialStateModule'
      },
      {
        path: 'credit-note',
        loadChildren: './credit-note/credit-note.module#CreditNoteModule'
      },
      {
        path: 'bank-account',
        loadChildren: './bank-account/bank-account.module#BankAccountModule'
      },
      {
        path: 'consumer-services',
        loadChildren: './consumer-services/consumer-services.module#ConsumerServicesModule'
      },
      {
        path: 'sector',
        loadChildren: './sector/sector.module#SectorModule'
      },
      {
        path: 'charge',
        loadChildren: './charge/charge.module#ChargeModule'
      }
    ]
  },
  {
    path: '',
    component: BlankLayoutComponent,
    data: {
      title: 'Blank'
    },
    children: [
      {
        path: '',
        loadChildren: './_guards/guards.module#GuardsModule',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
