import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { BillComponent } from './bill.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { HttpLoaderFactory } from '../../app.translate';
import { BillService } from '../../services/bill.service';
import { Router } from '@angular/router';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions, Http } from '@angular/http';
import { Bill } from '../../models/bill.model';
import { BILL_FIXTURE } from '../../fixtures/bill.fixture';
import { DataFilterModule } from '../../pipes/datafilter.module';
import { DataTableModule } from 'angular2-datatable';


describe('BillComponent', () => {
  const mockArray: Array<Bill> = BILL_FIXTURE;
  let component: BillComponent;
  let fixture: ComponentFixture<BillComponent>;
  let service: BillService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        BillService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Router,
          useClass: class {
            navigate = jasmine.createSpy('navigate');
          }
        },
        {
          provide: Http,
          useFactory: (backend: MockBackend, options: BaseRequestOptions) => new Http(backend, options),
          deps: [ MockBackend, BaseRequestOptions ]
        }
      ],
      declarations: [ BillComponent ],
      imports: [ TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [ Http ]
        }
      }), FormsModule, DataFilterModule, DataTableModule ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(BillComponent);
        component = fixture.componentInstance;
        service = TestBed.get(BillService);
        router = TestBed.get(Router);
      });
  }));

  describe('Functional: ', () => {
    it('should instantiate component', () => {
      expect(component).toBeTruthy();
      expect(fixture.componentInstance instanceof BillComponent).toBeTruthy();
    });

    it('should call service', async(inject([ BillService ], (billService) => {
      // spyOn(billService, 'all').and.callThrough();
      // spyOn(billService, 'all').and.returnValue(Observable.of(mockArray));
    })));

    it('should call methods', async(() => {
      // expect(component.ngOnInit()).toBeNull();
      // expect(component.getAll()).toBeNull();
      // expect(component.ngOnDestroy()).toBeNull();
    }));

    it('test methods', async(inject([ BillService ], (billService) => {
      // spyOn(billService, 'all').and.returnValue(Observable.of(mockArray));
      // console.log(component.data)
      // const spyNgOnInit = spyOn(component, 'ngOnInit').and.callThrough();
      // const spy = spyOn(component, 'ngOnInit').and.returnValue(Observable.of(mockArray));
      // expect(component).toBeDefined();
      // expect(spy);
      // console.log(component.data);
      // expect(component);
      // expect(component.getAll()).toHaveBeenCalled();
    })));

    it('Validate Observable response', () => {
      // spyOn(component, 'ngOnInit').and.returnValue(Observable.of(mockArray));
      // console.log(component.data);
      // expect(component.data).toEqual(mockArray);
    });

  });
});
