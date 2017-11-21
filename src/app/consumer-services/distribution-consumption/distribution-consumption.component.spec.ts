import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionConsumptionComponent } from './distribution-consumption.component';

describe('DistributionConsumptionComponent', () => {
  let component: DistributionConsumptionComponent;
  let fixture: ComponentFixture<DistributionConsumptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistributionConsumptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistributionConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
