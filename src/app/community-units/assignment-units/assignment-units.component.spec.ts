import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentUnitsComponent } from './assignment-units.component';

describe('AssignmentUnitsComponent', () => {
  let component: AssignmentUnitsComponent;
  let fixture: ComponentFixture<AssignmentUnitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentUnitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
