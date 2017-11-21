import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPropertyComponent } from './assign-property.component';

describe('AssignPropertyComponent', () => {
  let component: AssignPropertyComponent;
  let fixture: ComponentFixture<AssignPropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
