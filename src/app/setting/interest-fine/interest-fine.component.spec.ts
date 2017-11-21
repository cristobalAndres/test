import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestFineComponent } from './interest-fine.component';

describe('LatePaymentComponent', () => {
  let component: InterestFineComponent;
  let fixture: ComponentFixture<InterestFineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterestFineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestFineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
