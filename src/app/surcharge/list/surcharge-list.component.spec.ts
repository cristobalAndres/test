import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurchargeListComponent } from './surcharge-list.component';

describe('SurchargeListComponent', () => {
  let component: SurchargeListComponent;
  let fixture: ComponentFixture<SurchargeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurchargeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurchargeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
