import { Expense } from '../models/expense.model';
import { OutCome } from '../models/expense.model';

export const ExpenseMocks: Expense[] = [
  {
    id: 1,
    code: '3',
    date: new Date().toString(),
    expiration_date: new Date().toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    deleted_at: new Date().toString(),
    amount: 100000,
    description: 'das dasdsad',
    supplier_id: 1,
    expense_type_id: 2, expenseState: true,
    expense_type: {
      id: 1,
      name: 'BOLETA',
      code: '3'
    },
    supplier: {
      id: 1,
      name: 'ENEL',
      code: '3'
    },
    supplier_name: 'ENEL',
    community_id: 2,
    expense_assignments: [
      {
        amount: 224000,
        account_id: 227,
        account_primary_id: 216,
        expense_fees: [
          {
            amount: 64000,
            description: 'Cuota  1 / 2',
            number: 1,
            period: 201701,
            expense_fee_sectors: [
              {
                sector_id: 8,
                name: 'DEFAULT_SECTOR',
                active: true,
                slug: 'DEFAULT_SECTOR',
                amount: 64000
              },
              {
                sector_id: 1,
                name: 'Sector A',
                active: true,
                slug: 'SECTOR_A',
                amount: 0
              },
              {
                sector_id: 2,
                name: 'Sector B',
                active: true,
                slug: 'SECTOR_B',
                amount: 0
              },
              {
                sector_id: 3,
                name: 'Sector C',
                active: true,
                slug: 'SECTOR_C',
                amount: 0
              },
              {
                sector_id: 4,
                name: 'Sector D',
                active: true,
                slug: 'SECTOR_D',
                amount: 0
              }
            ],
            porcent: 20,
            code: 0,
            position: null
          },
          {
            amount: 160000,
            description: 'Cuota  2 / 2',
            number: 2,
            period: 201702,
            expense_fee_sectors: [
              {
                sector_id: 8,
                name: 'DEFAULT_SECTOR',
                active: true,
                slug: 'DEFAULT_SECTOR',
                amount: 160000
              },
              {
                sector_id: 1,
                name: 'Sector A',
                active: true,
                slug: 'SECTOR_A',
                amount: 0
              },
              {
                sector_id: 2,
                name: 'Sector B',
                active: true,
                slug: 'SECTOR_B',
                amount: 0
              },
              {
                sector_id: 3,
                name: 'Sector C',
                active: true,
                slug: 'SECTOR_C',
                amount: 0
              },
              {
                sector_id: 4,
                name: 'Sector D',
                active: true,
                slug: 'SECTOR_D',
                amount: 0
              }
            ],
            porcent: 50,
            code: 0,
            position: null
          }
        ],
        feesCount: 2,
        expense_assignment_id: 1
      },
      {
        amount: 96000,
        account_id: 234,
        account_primary_id: [
          0
        ],
        expense_fees: [],
        expense_assignment_id: [
          1
        ]
      }
    ],
    outcomes: new OutCome()
  },
  {
    id: 2,
    code: '4',
    date: new Date().toString(),
    expiration_date: new Date().toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    deleted_at: new Date().toString(),
    amount: 300000,
    description: 'das dasdsad',
    supplier_id: 1,
    expense_type_id: 2, expenseState: true,
    expense_type: {
      id: 1,
      name: 'BOLETA',
      code: '3'
    },
    supplier: {
      id: 1,
      name: 'ENEL',
      code: '3'
    },
    supplier_name: 'ENEL',
    community_id: 2,
    expense_assignments: [
      {
        amount: 224000,
        account_id: 227,
        account_primary_id: 216,
        expense_fees: [
          {
            amount: 64000,
            description: 'Cuota  1 / 2',
            number: 1,
            period: 201701,
            expense_fee_sectors: [
              {
                sector_id: 8,
                name: 'DEFAULT_SECTOR',
                active: true,
                slug: 'DEFAULT_SECTOR',
                amount: 64000
              },
              {
                sector_id: 1,
                name: 'Sector A',
                active: true,
                slug: 'SECTOR_A',
                amount: 0
              },
              {
                sector_id: 2,
                name: 'Sector B',
                active: true,
                slug: 'SECTOR_B',
                amount: 0
              },
              {
                sector_id: 3,
                name: 'Sector C',
                active: true,
                slug: 'SECTOR_C',
                amount: 0
              },
              {
                sector_id: 4,
                name: 'Sector D',
                active: true,
                slug: 'SECTOR_D',
                amount: 0
              }
            ],
            porcent: 20,
            code: 0,
            position: null
          },
          {
            amount: 160000,
            description: 'Cuota  2 / 2',
            number: 2,
            period: 201702,
            expense_fee_sectors: [
              {
                sector_id: 8,
                name: 'DEFAULT_SECTOR',
                active: true,
                slug: 'DEFAULT_SECTOR',
                amount: 160000
              },
              {
                sector_id: 1,
                name: 'Sector A',
                active: true,
                slug: 'SECTOR_A',
                amount: 0
              },
              {
                sector_id: 2,
                name: 'Sector B',
                active: true,
                slug: 'SECTOR_B',
                amount: 0
              },
              {
                sector_id: 3,
                name: 'Sector C',
                active: true,
                slug: 'SECTOR_C',
                amount: 0
              },
              {
                sector_id: 4,
                name: 'Sector D',
                active: true,
                slug: 'SECTOR_D',
                amount: 0
              }
            ],
            porcent: 50,
            code: 0,
            position: null
          }
        ],
        feesCount: 2,
        expense_assignment_id: 1
      },
      {
        amount: 96000,
        account_id: 234,
        account_primary_id: [
          0
        ],
        expense_fees: [],
        expense_assignment_id: [
          1
        ]
      }
    ],
    outcomes: new OutCome()
  },
  {
    id: 3,
    code: '5',
    date: new Date().toString(),
    expiration_date: new Date().toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    deleted_at: new Date().toString(),
    amount: 400000,
    description: 'das dasdsad',
    supplier_id: 1,
    expense_type_id: 2, expenseState: true,
    expense_type: {
      id: 1,
      name: 'BOLETA',
      code: '3'
    },
    supplier: {
      id: 1,
      name: 'ENEL',
      code: '3'
    },
    supplier_name: 'ENEL',
    community_id: 2,
    expense_assignments: [],
    outcomes: new OutCome()
  },
  {
    id: 4,
    code: '6',
    date: new Date().toString(),
    expiration_date: new Date().toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    deleted_at: new Date().toString(),
    amount: 500000,
    description: 'das dasdsad',
    supplier_id: 1,
    expense_type_id: 2, expenseState: true,
    expense_type: {
      id: 1,
      name: 'BOLETA',
      code: '3'
    },
    supplier: {
      id: 1,
      name: 'ENEL',
      code: '3'
    },
    supplier_name: 'ENEL',
    community_id: 2,
    expense_assignments: [],
    outcomes: new OutCome()
  },
  {
    id: 5,
    code: '7',
    date: new Date().toString(),
    expiration_date: new Date().toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    deleted_at: new Date().toString(),
    amount: 1000,
    description: 'das dasdsad',
    supplier_id: 1,
    expense_type_id: 2, expenseState: true,
    expense_type: {
      id: 1,
      name: 'BOLETA',
      code: '3'
    },
    supplier: {
      id: 1,
      name: 'ENEL',
      code: '3'
    },
    supplier_name: 'ENEL',
    community_id: 2,
    expense_assignments: [],
    outcomes: new OutCome()
  },
  {
    id: 6,
    code: '8',
    date: new Date().toString(),
    expiration_date: new Date().toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    deleted_at: new Date().toString(),
    amount: 5000,
    description: 'das dasdsad',
    supplier_id: 1,
    expense_type_id: 2, expenseState: true,
    expense_type: {
      id: 1,
      name: 'BOLETA',
      code: '3'
    },
    supplier: {
      id: 1,
      name: 'ENEL',
      code: '3'
    },
    supplier_name: 'ENEL',
    community_id: 2,
    expense_assignments: [],
    outcomes: new OutCome()
  }
];
