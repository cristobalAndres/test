import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpenseAccountingAccountComponent } from './expense-accounting-account.component';
import { TranslateStore } from '@ngx-translate/core/src/translate.store';

describe('ExpenseAccountingAccountComponent', () => {
  let component: ExpenseAccountingAccountComponent;
  let fixture: ComponentFixture<ExpenseAccountingAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseAccountingAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseAccountingAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
