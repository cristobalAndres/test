import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionServicesComponent } from './consumption-services.component';

describe('ConsumptionServicesComponent', () => {
  let component: ConsumptionServicesComponent;
  let fixture: ComponentFixture<ConsumptionServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumptionServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumptionServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
