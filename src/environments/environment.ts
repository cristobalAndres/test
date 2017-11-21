// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  BASE_URL_IMPORT: 'https://kastor-api-import-com-stag.herokuapp.com',
  BASE_URL_INITIAL_BALANCE: 'https://kastor-initial-balance-devel.herokuapp.com',
  BASE_URL_REPORT: 'https://kastor-jsreport-staging.herokuapp.com/api/report',
  BASE_URL_CRUD: 'https://kastor-crud-express-staging.herokuapp.com',
  BASE_URL_ACCOUTING_ACCOUNT: 'https://kastor-accounting-staging.herokuapp.com',
  BASE_URL_BULK_UPLOAD: 'https://kastor-bulk-express-staging.herokuapp.com',
  BASE_URL_COMMON_EXPENSES: 'https://kastor-common-expenses-staging.herokuapp.com',
  BASE_URL_SSO: 'https://kastor-sso-staging.herokuapp.com',
  REALM: 'kastor'
};
