import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataFilter'
})
export class DataFilterPipe implements PipeTransform {

  transform(array: any[], args: {}): any {
    const defaults = {
      query: '',
      cols: []
    };
    const opts = Object.assign(defaults, args);

    if (opts.query) {
      return array.filter(row => {
        return Object.keys(row).some(el => {
          return (opts.cols.indexOf(el) > -1 && row[el].toString().toLowerCase().indexOf(opts.query.toLowerCase()) > -1);
        });
      });
    }
    return array;
  }
}
