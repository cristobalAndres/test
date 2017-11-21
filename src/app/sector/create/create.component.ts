import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

// Models
import { Property } from '../../models/property.model';

// Services
import { PropertyService } from '../../services/property.service';
import { SectorService } from '../../services/sector.service';
import { HelperService } from '../../services/helpers.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit, OnDestroy {

  // variables
  public formSector: FormGroup;
  public communityId: number;
  public properties: any[];
  public componentDestroyed: Subject<boolean> = new Subject();
  public isLoading: Boolean = true;
  public proportion: number = 0;
  public unitAmountSelected: number = 0;
  public unitAmountSelectedAux: number = 0;
  public selectedMethod: Boolean = true;
  public disabledSendSector: Boolean = false;
  public totalPercentUnits: number = 0;
  public types: any;
  public typeSelected: number = 0;
  @ViewChild(ModalDirective) public confirmationDifference: ModalDirective;
  public messageModal: any = {
    percent: ''
  };

  constructor(
    private _propertyService: PropertyService,
    private _sectorService: SectorService,
    private _toasterService: ToasterService,
    private _translateService: TranslateService,
    private _helperService: HelperService,
    private _fb: FormBuilder
  ) { }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.initForm();
    this.getInitView();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  // iniciamos servicios
  public getInitView(): void {
    const getProperties = this._propertyService.all(this.communityId, false);
    const getTypeFields = this._sectorService.getTypeFields();
    Observable.forkJoin(
      getProperties.map(property => property.json() as Property[]),
      getTypeFields)
      .takeUntil(this.componentDestroyed)
      .subscribe(res => {
        // rescatamos propiedades
        this.properties = res[0];
        if (this.properties) {
          this.properties.map(p => p.state = false);
        }

        // rescatamos tipos de calculo y asignamos el tipo automático como por defecto
        const types = res[1].json().filter(t => t.key === 'FACTOR_TYPE');
        if (types) {
          this.types = types.reverse();
          const objectType = types.find(t => t.name === 'AUTOMATIC');
          this.typeSelected = objectType.id;
        }

        this.isLoading = false;
      }, error => {
        this._translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
          .subscribe((translation: string) => {
            this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
          });
        this.isLoading = false;
      });
  }

  // iniciamos formulario raiz reactivo
  public initForm(): void {
    this.formSector = this._fb.group({
      name: [null, Validators.required],
      units: this._fb.array([]),
      difference: null,
      type: 0
    });
  }

  // iniciamos formulario unidad reactivo
  public initFormUnit(object: any) {
    return this._fb.group({
      id: object ? object.id : null,
      percent: 0,
      name: object ? object.name : null,
      factor: object ? (+object.sectors[0].unit_sector
        .factor) : null
    });
  }

  public factor(unit: any, request: string): any {
    if (request === 'name') {
      return unit.name;
    }
    if (request === 'factor') {
      return unit.factor;
    }
    if (request === 'recalculate') {
      return unit.percent;
    }
  }

  // agregamos objeto unidad a formulario
  public addUnit(object: any): void {
    const control = <FormArray>this.formSector.controls['units'];
    const addrCtrl = this.initFormUnit(object);
    control.push(addrCtrl);
  }

  // eliminar unidad
  public removeUnit(i: number): void {
    const ctrl = <FormArray>this.formSector.controls['units'];
    ctrl.removeAt(i);
  }

  // se ejecuta al presionar methodo de repartición (Automático/Manual)
  public selectMethod(method?: any): void {
    if (method === 1) {
      this.selectedMethod = false;
    } else {
      this.selectedMethod = true;
    }
    if (method) {
      this.typeSelected = method;
    } else {
      const automatic = this.types.find(t => t.name === 'AUTOMATIC');
      this.typeSelected = automatic.id;
    }
    if (this.selectedMethod) {
      const units = this.formSector['controls'].units.value;
      units.forEach((uni, _i) => {
        uni.percent = ((parseFloat(parseFloat(uni.factor.toString()).toFixed(2)) / this.proportion) * 100);
        this.formSector['controls'].units['controls'][_i]['controls'].factor.setValue(uni.factor);
        this.formSector['controls'].units['controls'][_i]['controls'].percent.setValue(uni.percent);
      });
      this.sumPercentUnits();
      this.disabledSendSector = false;
    }
  }

  // calcula procentaje según formula de prorrateo
  public calculatePercent(): void {
    let total = 0;
    const units = this.formSector.controls.units.value;
    units.forEach(unit => {
      total = (+total) + (+unit.percent);
    });

    // if (total > 100) {
    //   this.disabledSendSector = true;
    // } else {
    //   this.disabledSendSector = false;
    // }

    this.totalPercentUnits = total;
  }

  // suma los porcentajes de las unidades, factor recalculado
  public sumPercentUnits(): any {
    let sum = 0;
    const units = this.formSector['controls'].units.value;
    units.forEach(unit => {
      sum = (+sum) + (+unit.percent);
    });
    if (sum !== 100 && sum !== 0) {
      sum = 0;
      let sumDiff = 0;
      const _lastIndex = (units.length - 1);
      units.forEach((unit, _i) => {
        if (_i !== _lastIndex) {
          sumDiff = (+sumDiff) + (+unit.percent);
          sum = (+sum) + (+unit.percent);
        }
      });
      const different = (100 - sumDiff);
      sum = (+sum) + (+different);
      this.formSector['controls'].units['controls'][_lastIndex]['controls'].percent.setValue(different);
    }
    this.totalPercentUnits = sum;
    return sum;
  }

  // se ejecuta al presionar propiedad CHECK
  public activeCardDistribution(property: any): void {
    this.disabledSendSector = false;
    if (property.state) {
      property.units.forEach(unit => {
        const _existUnit = this.formSector.controls['units'].value.findIndex(u => u.id === unit.id);
        if (_existUnit !== -1) {
          this.removeUnit(_existUnit);
        }
      });
      // property.state = false;
      property.units.forEach(unit => {
        unit.state = false;
        this.activeCardDistributionUnit(unit, property, true);
      });
    } else {
      property.units.forEach(unit => {
        const _existUnit = this.formSector.controls['units'].value.findIndex(u => u.id === unit.id);
        if (_existUnit === -1) {
          unit.state = true;
          this.activeCardDistributionUnit(unit, property, true);
        }
      });
    }
  }

  // se ejecuta al presionar unidad CHECK
  public activeCardDistributionUnit(unit: any, property: any, father?: Boolean): void {
    this.disabledSendSector = false;
    this.proportion = 0;
    if (!father) {
      unit.state = !unit.state;
    }

    if (!unit.state) {
      const _index = this.formSector.controls['units'].value.findIndex(u => u.id === unit.id);
      if (_index !== -1) {
        this.removeUnit(_index);
      }
    } else {
      const unidades = this.formSector.controls.units.value;
      const existe = unidades.findIndex(u => u.id === unit.id);
      this.addUnit(unit);
    }
    const total = property.units.length;
    const selected = property.units.filter(p => p.state === true).length;
    if (total === selected) {
      property.state = true;
    } else {
      property.state = false;
    }

    this.percentUnit();

    this.calculatePercent();

  }

  // calcula el procentaje según als unidades seleccionadas(se ejecuta cada vez que ingresa o sale una undiad de la asignación a sector)
  public percentUnit(): void {
    const units = this.formSector.controls['units'].value;
    units.forEach((uni, _i) => {
      this.proportion = (+this.proportion) + (+uni.factor);
    });

    units.forEach((uni, _i) => {
      uni.percent = ((parseFloat(parseFloat(uni.factor.toString()).toFixed(2)) / this.proportion) * 100);
      this.formSector['controls'].units['controls'][_i]['controls'].factor.setValue(uni.factor);
      this.formSector['controls'].units['controls'][_i]['controls'].percent.setValue(uni.percent);
    });

    this.sumPercentUnits();
  }

  hideModal(): void {
    this.messageModal.percent = 0;
  }

  onHidden(): void {
    this.messageModal.percent = 0;
  }

  // validamos porcentajes
  public validatePercent(form: any): void {
    this.calculatePercent();
    if (this.totalPercentUnits !== 100) {
      this.messageModal.percent = 0;
      const diff = (100 - this.totalPercentUnits);
      this.messageModal.percent = diff;
      form.difference = diff;
      this.confirmationDifference.show();
    } else {
      this.sendSector(form);
    }
  }

  public deselectedItem(): void {
    this.messageModal.percent = 0;
  }

  // guardamos sector y sus asignaciones
  public sendSector(form: any): void {
    if (this.totalPercentUnits === 100) {
      form.difference = null;
    }
    form.type = this.typeSelected;
    this.isLoading = true;
    this._sectorService.post(this.communityId, form)
      .subscribe(res => {
        this.isLoading = false;
        this.totalPercentUnits = 0;
        this.initForm();
        this.properties.forEach(property => {
          property.state = false;
          property.units.forEach(unit => {
            unit.state = false;
          });
        });
        this._translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            this._toasterService.pop('success',
              translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
          });
      }, err => {
        this.isLoading = false;
        const messageKey = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
        this._translateService.get(['GENERAL.ERROR_TITLE', messageKey])
          .takeUntil(this.componentDestroyed)
          .subscribe((translation: string) => {
            switch (+err.status) {
              case 404:
                this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                break;
              case 500:
                this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                break;
              case 400:
                this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                break;
              default:
                this._toasterService.pop('error', translation['GENERAL.ERROR_TITLE'], translation[messageKey]);
                break;
            }
          });
      });
  }

}
