import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentAdvanceComponent } from './payment-advance.component';

describe('PaymentAdvanceComponent', () => {
  let component: PaymentAdvanceComponent;
  let fixture: ComponentFixture<PaymentAdvanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentAdvanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
