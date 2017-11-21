/**
 * Takes a positive integer and returns the corresponding column name.
 * Reference: http://cwestblog.com/2013/09/05/javascript-snippet-convert-number-to-column-name/
 * @param {number} num  The positive integer to convert to a column name.
 * @return {string}  The column name.
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toXLSColumnName'
})
export class ToXLSColumnNamePipe implements PipeTransform {

  transform(num: number): string {
    let ret: string, a: number, b: number;
    for (ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(((num % b) / a) + 65) + ret;
    }
    return ret;
  }
}
