import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountCodeMask'
})
export class AccountCodeMaskPipe implements PipeTransform {

  transform(code: string | number, args: {}): any {
    const defaults = {
      separator: '-',
    };
    const opts = Object.assign(defaults, args);

    let maskedCode = code;
    if (typeof maskedCode === 'number') {
      maskedCode = maskedCode.toString();
    }

    if (maskedCode.length === 7) {
      maskedCode = `${maskedCode.substr(0, 2)}-${maskedCode.substr(2, 2)}-${maskedCode.substr(-3)}`;
    }

    return maskedCode;
  }
}
