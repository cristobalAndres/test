import { Injectable } from '@angular/core';
import { AppService } from '../app.service';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import * as moment from 'moment/moment'

@Injectable()
export class HelperService extends AppService {

  // validamos que caracteres de input sean solo numeros
  public validateCharacter(e: any) {
    if (e.keyCode < 45 || e.keyCode > 57) {
      e.returnValue = false;
    }
  }

  // función que retorna fecha en vista según formato que se le pase
  public formatDate(date: string, format: string): string {
    return moment(date).format(format);
  }

  // función para formatear JSON
  public formatJson(json: any) {
    return JSON.stringify(json)
  }

  // ordenamos lista en vista
  public sortListProperties(list: any[]): void {
    list.sort(prop => {
      if (prop.state === true) {
        return -1;
      } else if (prop.state !== true) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  // devuelve suma de elementos que se le pase, recibe lista y busca por campo que se le indique en segundo parametro
  public sumOfAmounts(list: any, fieldToAdd: string): number {
    let amount = 0;
    list.forEach(element => {
      if (fieldToAdd in element) {
        amount = amount + (+element[fieldToAdd]);
      }
    });
    return amount;
  }

  // devuelve true si los elementos de una lista no coincide al agregar un ultimo elemento
  public verifyStringsEquals(list: any, newElement: string): boolean {
    let res = false;
    if (list.indexOf(newElement) !== -1) {
      res = true;
    }
    return res;
  }
}
