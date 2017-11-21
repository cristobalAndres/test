import { Component, OnInit, OnDestroy } from '@angular/core';
import { PropertyUnitsMock } from '../../mocks/property-units.mock';
import { PropertyService } from '../../services/property.service';
import { HelperService } from '../../services/helpers.service';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { CommunityService } from '../../services/community.service';
import { Subject } from 'rxjs/Subject';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-assignment-units',
  templateUrl: './assignment-units.component.html',
  styleUrls: ['./assignment-units.component.scss']
})
export class AssignmentUnitsComponent implements OnInit, OnDestroy {
  data = [];
  properties = [];
  propertiesAux = [];
  communityId: number;
  propertyId: number;
  isAnySelected: boolean = false;
  unitId: number;
  isCreatingUnit: boolean = false;
  isLoading: boolean = true;
  public createUnitModalParam = {
    value: ''
  };
  unitTypes: any = [];
  public selectedProperty: any = {
    name: '', id: 0
  };
  public createUnitForm: FormGroup;
  private componentDestroyed: Subject<boolean> = new Subject();
  searchElement: any;
  unitsSelected: any = [];
  propertySelected: any = null;
  validateAnyCheckSelected: any = [{
    status: false,
    id: ''
  }];
  constructor(private _propertyService: PropertyService,
              private _helperService: HelperService,
              private _comunityService: CommunityService,
              private toasterService: ToasterService,
              private translateService: TranslateService,
              private fb: FormBuilder) {
                this.createUnitForm = fb.group({
                  name: [null, Validators.required],
                  unit_type: [null, Validators.required],
                  area: [null, Validators.required],
                  floor: [null, Validators.required],
                  factor: [null, Validators.required],
                });
              }
  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.initServices();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  initServices() {
    this.isLoading = true;
    this._propertyService.all(this.communityId)
    .takeUntil(this.componentDestroyed)
    .subscribe(data => {
      this.data = data.json();
      this.calculateFactor();
      this.split();
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
    });
    this._comunityService.getUnits(this.communityId)
    .takeUntil(this.componentDestroyed)
    .subscribe(unitTypes => {
      this.unitTypes = unitTypes.json();
    });
  }

  calculateFactor() {
    let total_factor = 0;
    let total_factor_unit = 0;
    this.data.forEach((property) => {
      property.units.forEach((unit) => {
        unit.sectors.forEach((sectors) => {
          total_factor += +sectors.unit_sector.factor;
          total_factor_unit += +sectors.unit_sector.factor;
        });
        unit.total_factor = total_factor_unit;
        total_factor_unit = 0;
        unit.isSelected = false;
      });
      property.total_factor = total_factor;
      property.state = false;
      property.selected = false;
      property.list = false;
      total_factor = 0;
      property.hasSelectedUnits = false;
    });
  }

  split() {
    let len = this.data.length;
    if (len > 0) {
      len = len / 2;
      this.data.forEach((data, _indice) => {
        if (_indice < len) {
          this.properties.push(data);
        } else {
          this.propertiesAux.push(data);
        }
      })
    }
  }

  releaseDropLeft(event: any, data: any) {
    let element = this.properties.filter(i => i.id === data.id ? data : null);
    if (element.length > 0) {
      this.properties.forEach((j) => {
        if (j.id === element[0].id) {
          const indice = j.units.findIndex(i => i.id === event.id);
          j.units.splice(indice, 1);
        }
      });
    } else {
      element = this.propertiesAux.filter(i => i.id === data.id ? data : null);
      this.propertiesAux.forEach((k) => {
        if (k.id === element[0].id) {
          const indice = k.units.findIndex(i => i.id === event.id);
          k.units.splice(indice, 1);
        }
      });
    }
    this.calculateFactor();
    this.assignUnit(data.id);
  }

  releaseDropRight(event: any, data: any) {
    let element = this.properties.filter(i => i.id === data.id ? data : null);
    if (element.length > 0) {
      this.properties.forEach((j) => {
        if (j.id === element[0].id) {
          const indice = j.units.findIndex(i => i.id === event.id);
          j.units.splice(indice, 1);
        }
      });
    } else {
      element = this.propertiesAux.filter(i => i.id === data.id ? data : null);
      this.propertiesAux.forEach((k) => {
        if (k.id === element[0].id) {
          const indice = k.units.findIndex(i => i.id === event.id);
          k.units.splice(indice, 1);
        }
      });
    }
    this.calculateFactor();
    this.assignUnit(data.id);
  }

  startDragRight(item: any) {
  }
  startDragLeft(item: any) {
  }

  addDropItemRight(event: any, data: any) {
    this.propertyId = data.id;
    this.unitId = event.id;
    let element = this.properties.filter(i => i.id === data.id ? data : null);
    if (element.length > 0) {
      this.properties.forEach((j) => {
        if (j.id === element[0].id) {
          j.units.push(event);
        }
      })
    } else {
      element = this.propertiesAux.filter(i => i.id === data.id ? data : null);
      this.propertiesAux.forEach((k) => {
        if (k.id === element[0].id) {
          k.units.push(event);
        }
      })
    }
  }

  addDropItemLeft(event: any, data: any) {
    this.propertyId = data.id;
    this.unitId = event.id;
    let element = this.properties.filter(i => i.id === data.id ? data : null);
    if (element.length > 0) {
      this.properties.forEach((j) => {
        if (j.id === element[0].id) {
          j.units.push(event);
        }
      })
    } else {
      element = this.propertiesAux.filter(i => i.id === data.id ? data : null);
      this.propertiesAux.forEach((k) => {
        if (k.id === element[0].id) {
          k.units.push(event);
        }
      })
    }
  }

  search(data: any) {
    this.searchElement = this.searchElementHelper(data);
    if (!this.searchElement) {
      this.searchElement = this.searchElementHelperAux(data);
    }
  }

  searchElementHelper(data: any) {
    const indice = this.properties.findIndex((c) => c.name.toLowerCase() === data.toLowerCase());
    if (indice !== -1) {
      this.properties[indice].state = true;
      this._helperService.sortListProperties(this.properties);
      return true;
    }
    this.properties.forEach((p) => {
      p.state = false;
    });
    return false;
  }

  searchElementHelperAux(data: any) {
    const indice = this.propertiesAux.findIndex((c) => c.name.toLowerCase() === data.toLowerCase());
    if (indice !== -1) {
      this.propertiesAux[indice].state = true;
      this._helperService.sortListProperties(this.propertiesAux);
      return true;
    }
    this.propertiesAux.forEach((p) => {
      p.state = false;
    });
    return false;
  }

  dropEventMouse(event: any) {
  }

  dragEnterRight(event: any, data: any) {
  }
  dragEnterLeft(event: any, data: any) {
  }

  dragLeave() {

  }

  dragoverMouse(event: any) {
  }

  assignUnit(oldId) {
    const dataAssign = [{property_id: this.propertyId, unit_id: this.unitId}];
    this._propertyService.assignUnitToProperty(this.communityId, dataAssign).subscribe(response => {
      this.translateService.get(['GENERAL.SUCCESS_TITLE', 'COMMUNITY-UNITS.GENERAL.MESSAGE_SUCCESS_UNIT_ASSIGMENT'])
      .takeUntil(this.componentDestroyed)
      .subscribe((translation: string) => {
        this.toasterService.pop('success',
          translation['GENERAL.SUCCESS_TITLE'], translation['COMMUNITY-UNITS.GENERAL.MESSAGE_SUCCESS_UNIT_ASSIGMENT']);
      });
    }, error => {
      this.translateService.get(['GENERAL.ERROR_TITLE', 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'])
      .takeUntil(this.componentDestroyed)
      .subscribe((res: string) => {
        this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res['GENERAL.NOTIFICATION.UNKNOWN_ERROR']);
      });
    })
  }

  selectedUnit(unit: any, property: any) {
    const iProperty = this.data.findIndex(d => d.id === property.id);
    let hasSelectedUnits = false;
    this.data[iProperty].units.forEach((u) => {
      if (u.id === unit.id) {
        u.isSelected = !u.isSelected
        // check if property has any unit selected
        if (u.isSelected) {
          // set property as selected
          hasSelectedUnits = true;
        }
      }
    });
    // actualiza property
    this.data[iProperty].hasSelectedUnits = hasSelectedUnits;
    this.findSelected(property, unit).length > 0 ? this.isAnySelected = true : this.isAnySelected = false;
    this.validateAnySelected(property);
  }

  findSelected(property: any, unit: any) {
    /* const iProperty = this.data.findIndex(d => d.id === property.id);
    return this.unitsSelected = this.data[iProperty].units.filter(u => u.isSelected ? u : null); */
    this.data.forEach((r) => {
      r.units.forEach((u) => {
        if (u.isSelected) {
          if (this.unitsSelected.filter(i => i.id === u.id ? i : null).length === 0 ) {
            this.unitsSelected.push(u);
            this.isAnySelected = true;
          }
        }
      })
    });
    this.unitsSelected.forEach((p, i) => {
      if (p.id === unit.id && !p.isSelected) {
        this.unitsSelected.splice(i, 1);
      }
    });
    return this.unitsSelected;
  }

  onSelectProperty(property: any) {
    this.data.forEach(p => p.id === property.id ? p.list = !p.list : p.list = false);
    this.propertySelected = property;
  }

  reload() {
    this.data = [];
    this.properties = [];
    this.propertiesAux = [];
    this.unitsSelected = [];
    this.isAnySelected = false;
    this.propertySelected = null;
    this.initServices();
  }

  assignUnitToProperty() {
    const dataAssign = [];
    this.unitsSelected.forEach((unit) => {
      dataAssign.push({unit_id: unit.id, property_id: this.propertySelected.id})
    });
    this._propertyService.assignUnitToProperty(this.communityId, dataAssign).subscribe(response => {
      this.translateService.get(['GENERAL.SUCCESS_TITLE', 'GENERAL.NOTIFICATION.SUCCESS'])
        .subscribe((translation: string) => {
          this.toasterService.pop('success', translation['GENERAL.SUCCESS_TITLE'], translation['GENERAL.NOTIFICATION.SUCCESS']);
        });
      this.reload()
    }, error => {
      console.log(error);
    })
  }

  selectAllUnit(property: any) {
    this.data.forEach((p) => {
      p.hasSelectedUnits = false;
      if (p.id === property.id) {
        p.units.forEach((u) => {
          u.isSelected = !p.selected;
          if (u.isSelected) {
            if (this.unitsSelected.filter(i => i.id === u.id ? i : null).length === 0 ) {
              this.unitsSelected.push(u);
            }
            this.isAnySelected = true;
          } else {
            // tslint:disable-next-line:no-shadowed-variable
            const indice = this.unitsSelected.findIndex(p => p.id === u.id);
            this.unitsSelected.splice(indice, 1);
            if (this.unitsSelected.length === 0) {
              this.isAnySelected = false;
            }
          }
        });
      }
    });
    console.log(this.unitsSelected.length);
    this.validateAnySelected(property);
  }

  validateAnySelected(property: any) {
    this.data.forEach((p) => {
      p.units.filter(u => u.isSelected ? u : null).length === p.units.length ? p.selected = true : p.selected = false;
    });
  }

  selectProperty(property: any) {
    this.createUnitForm.reset();
    this.selectedProperty.name = property.name;
    this.selectedProperty.id = property.id;
    this.createUnitModalParam.value = property.name;
  }

  public onSubmit(formData: any): void {
    formData.property_id = this.selectedProperty.id;
    formData.floor = formData.floor.toString();
    this.isCreatingUnit = true;
    this._comunityService.createUnit(this.communityId , formData)
      .takeUntil(this.componentDestroyed)
      .subscribe(() => {
        this.translateService.get(['GENERAL.SUCCESS_TITLE', 'PROPERTY.CREATE.SUCCESS'])
        .takeUntil(this.componentDestroyed)
        .subscribe((res: string) => {
          this.toasterService.pop('success', res['GENERAL.SUCCESS_TITLE'], res['PROPERTY.CREATE.SUCCESS']);
        });
        this.isCreatingUnit = false;
        this.reload();
      }, (error) => {
        console.log('error:', JSON.stringify(error));
        const DELETE_ERROR_MESSAGE = error.json().message ? 'PROPERTY.CREATE.ERRORS.' + error.json().message : 'GENERAL.NOTIFICATION.UNKNOWN_ERROR'
        this.translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
          .takeUntil(this.componentDestroyed)
          .subscribe((res: string) => {
            this.toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
          })
          this.isCreatingUnit = false;
      });
  }
}
