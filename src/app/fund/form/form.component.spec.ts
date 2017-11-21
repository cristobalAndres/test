import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundFormComponent } from './form.component';

describe('FundFormComponent', () => {
  let component: FundFormComponent;
  let fixture: ComponentFixture<FundFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
