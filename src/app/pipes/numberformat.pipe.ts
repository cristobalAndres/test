import { Injectable, Pipe, PipeTransform } from '@angular/core';

/*
 Generated class for the CurrencyFormat pipe.

 See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 Angular 2 Pipes.
 */
@Pipe({
  name: 'numberFormat'
})
@Injectable()
export class NumberFormatPipe implements PipeTransform {
  constructor() {
  }

  transform(item: any, opts: {} = {}): any {
    const defaults = {
      // number | currency | percent
      type: 'number',
      minimumFractionDigits: 3
    };
    const options = Object.assign(defaults, opts);
    if (item == null) {
      return '';
    }
    const number: number = Number(item);
    if (isNaN(number)) {
      return number;
    }
    switch (options.type) {
      case 'number':
        return number.toLocaleString('es-CL');
      case 'currency':
        return '$ ' + number.toLocaleString('es-CL', { minimumFractionDigits: 0 });
      case 'percent':
        return (number / 100).toLocaleString('es-CL', { style: 'percent', minimumFractionDigits: options.minimumFractionDigits });
      default:
        return number;
    }
  }
}
