// en contrucción
export class InterestFine {
  active: Boolean;
  community_id: number = 0;
  porcent: number = 0;
  fund_id: number = null;
  description: string = null;
  capital_reduction: Boolean = true;
  interest_fine_metadata: any[];
  community_periods: any[];
  debt_type: any[];
  periodicidad_id: any;
  interest_type_id: any;
  interest_rate_id: any = true;
  debt: Boolean = true;
  stateInteresRate: Boolean = true;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}


export class InterestFineView {
  porcent?: number;
  init_date?: string;
  end_date?: string;
  interest_fine_metadata_periodicity?: string;
  interest_fine_metadata_type?: string;
  fund_name?: string;
  description?: string = null;
  capital_reduction?: Boolean;

  constructor(interest: any) {
    this.parseInterestView(interest);
  }

  parseInterestView(interest: any): void {
    this.porcent = this.filterConventionalMaximun(interest);
    this.interest_fine_metadata_periodicity = interest.interest_fine_metadata ? interest.interest_fine_metadata.find(i => {
      if (i.interest_fine_field) {
        return i.interest_fine_field.key === 'PERIODICIDAD';
      }
    }) : null;
    this.interest_fine_metadata_type = interest.interest_fine_metadata ? interest.interest_fine_metadata.find(i => {
      if (i.interest_fine_field) {
        return i.interest_fine_field.key === 'TIPO_INTERES'
      }
    }) : null;
    this.fund_name = interest.fund ? interest.fund.name : null;
    this.description = interest.description ? interest.description : null;
    this.capital_reduction = interest.capital_reduction ? interest.capital_reduction : null;
    this.init_date = interest.init_date ? interest.init_date : null;
    this.end_date = interest.end_date ? interest.end_date : null;
  }

  filterConventionalMaximun(interest): number {
    let porcent = 0;
    if (interest.interest_fine_metadata) {
      interest.interest_fine_metadata.forEach(metadata => {
        if (metadata.interest_fine_field.key === 'TASA') {
          porcent = (+metadata.value);
        }
      });
    }
    return porcent;
  }
}
