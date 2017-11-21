import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'period'})
export class PeriodPipe implements PipeTransform {
  private months = [
    { number: 1, name: 'JANUARY' },
    { number: 2, name: 'FEBRUARY' },
    { number: 3, name: 'MARCH' },
    { number: 4, name: 'APRIL' },
    { number: 5, name: 'MAY' },
    { number: 6, name: 'JUNE' },
    { number: 7, name: 'JULY' },
    { number: 8, name: 'AUGUST' },
    { number: 9, name: 'SEPTEMBER' },
    { number: 10, name: 'OCTOBER' },
    { number: 11, name: 'NOVEMBER' },
    { number: 12, name: 'DECEMBER' },
  ];

  constructor() {
  }

  transform(period: string, opts: {} = {}): string {
    if (!period) {
      return '';
    }
    const defaults = {
      type: 'all'
    }
    const options = Object.assign(defaults, opts);

    const monthName = this.getPeriodMonthName(period);
    const year = this.getPeriodYear(period);

    switch (options.type) {
      case 'month':
        return `GENERAL.MONTHS.${monthName}`;
      case 'year':
        return year;
      case 'all':
      default:
        return `${monthName} ${year}`;
    };
  }

  private getPeriodMonthName(period: string): string {
    period = this.removeSlashFromPeriod(period);
    const monthStr = period.slice(4, 6);
    const month = this.months.find(x => x.number === +monthStr);
    return month.name;
  }

  private getPeriodYear(period: string): string {
    period = this.removeSlashFromPeriod(period);
    return period.slice(0, 4);
  }

  private removeSlashFromPeriod(period: string): string {
    return period.replace('-', '');
  }
}
