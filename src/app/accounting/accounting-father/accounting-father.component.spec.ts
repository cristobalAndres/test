import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountingFatherComponent } from './accounting-father.component';
import {Pipe, PipeTransform} from '@angular/core';
import { TranslateStore } from '@ngx-translate/core/src/translate.store';

import {AccountingComponent} from '../accounting.component';

describe('AccountingComponent', () => {
  let component: AccountingFatherComponent;
  let fixture: ComponentFixture<AccountingFatherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountingFatherComponent],
      imports: [ReactiveFormsModule],
      providers: [TranslateStore],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingFatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
