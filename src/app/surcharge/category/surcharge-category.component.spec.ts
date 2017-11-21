import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurchargeCategoryComponent } from './surcharge-category.component';

describe('SurchargeComponent', () => {
  let component: SurchargeCategoryComponent;
  let fixture: ComponentFixture<SurchargeCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurchargeCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurchargeCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
