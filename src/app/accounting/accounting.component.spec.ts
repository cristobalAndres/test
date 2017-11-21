import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountingComponent } from './accounting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule} from '@angular/router/testing';
import { ToasterModule } from 'angular2-toaster';
import { TranslateStore } from '@ngx-translate/core/src/translate.store';

describe('AccountingComponent', () => {
  let component: AccountingComponent;
  let fixture: ComponentFixture<AccountingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountingComponent ],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, ToasterModule ],
      providers: [TranslateStore],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
