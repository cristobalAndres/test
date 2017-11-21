import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialStateComponent } from './financial-state.component';

describe('FinancialStateComponent', () => {
  let component: FinancialStateComponent;
  let fixture: ComponentFixture<FinancialStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
