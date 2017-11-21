import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseAccountingAccountChildrenComponent } from './expense-accounting-account-children.component';

describe('ExpenseAccountingAccountChildrenComponent', () => {
  let component: ExpenseAccountingAccountChildrenComponent;
  let fixture: ComponentFixture<ExpenseAccountingAccountChildrenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseAccountingAccountChildrenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseAccountingAccountChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
