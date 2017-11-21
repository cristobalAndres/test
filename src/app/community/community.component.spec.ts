import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { CommunityComponent } from './community.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { HttpLoaderFactory } from '../app.translate';
import { PaymentService } from '../services/community.service';
import { Router } from '@angular/router';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions, Http } from '@angular/http';
import { Community } from '../models/community.model';
import { COMMUNITY_FIXTURE } from '../fixtures/community.fixture';
import { DataFilterModule } from '../pipes/datafilter.module';
import { DataTableModule } from 'angular2-datatable';


describe('PaymentComponent', () => {
  const mockArray: Array<Community> = COMMUNITY_FIXTURE;
  let component: CommunityComponent;
  let fixture: ComponentFixture<CommunityComponent>;
  let service: PaymentService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        PaymentService,
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
      declarations: [ CommunityComponent ],
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
        fixture = TestBed.createComponent(CommunityComponent);
        component = fixture.componentInstance;
        service = TestBed.get(PaymentService);
        router = TestBed.get(Router);
      });
  }));

  describe('Functional: ', () => {
    it('should instantiate component', () => {
      expect(component).toBeTruthy();
      expect(fixture.componentInstance instanceof CommunityComponent).toBeTruthy();
    });

    it('should call service', async(inject([ PaymentService ], (communityService) => {
      // spyOn(communityService, 'all').and.callThrough();
      // spyOn(communityService, 'all').and.returnValue(Observable.of(mockArray));
    })));

    it('should call methods', async(() => {
      // expect(component.ngOnInit()).toBeNull();
      // expect(component.getAll()).toBeNull();
      // expect(component.ngOnDestroy()).toBeNull();
    }));

    it('test methods', async(inject([ PaymentService ], (communityService) => {
      // spyOn(communityService, 'all').and.returnValue(Observable.of(mockArray));
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
