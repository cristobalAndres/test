import { Account } from '../models/account.model';

export const AccountMocks: Account[] = [
  {
    id: 33,
    name: 'Gastos Diferidos',
    created_at: '2017-08-02 16:29:45.477609',
    updated_at: '2017-08-02 16:29:45.477609',
    deleted_at: null,
    parent_id: 32,
    alias: 'Gastos Diferidos',
    code: 1115001,
    community_id: 2,
    children: [],
    active: true
  },
  {
    id: 2,
    name: 'Activo Circulante',
    created_at: '2017-08-02 16:29:45.477609',
    updated_at: '2017-08-02 16:29:45.477609',
    deleted_at: null,
    parent_id: 1,
    alias: 'Activo Circulante',
    code: 1100000,
    community_id: 2,
    children: [],
    active: true
  },
  {
    id: 3,
    name: 'Disponible',
    created_at: '2017-08-02 16:29:45.477609',
    updated_at: '2017-08-02 16:29:45.477609',
    deleted_at: null,
    parent_id: 2,
    alias: 'Disponible',
    code: 1110000,
    community_id: 2,
    children: [],
    active: true
  },
  {
    id: 5,
    name: 'Caja Chica',
    created_at: '2017-08-02 16:29:45.477609',
    updated_at: '2017-08-02 16:29:45.477609',
    deleted_at: null,
    parent_id: 4,
    alias: 'Caja Chica',
    code: 1111001,
    community_id: 2,
    children: [],
    active: true
  },
  {
    id: 19,
    name: 'Cuentas Individuales por Cobrar',
    created_at: '2017-08-02 16:29:45.477609',
    updated_at: '2017-08-02 16:29:45.477609',
    deleted_at: null,
    parent_id: 13,
    alias: 'Cuentas Individuales por Cobrar',
    code: 1113006,
    community_id: 2,
    children: [],
    active: true
  },
];
