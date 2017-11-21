import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignExpensesToDistributionComponent } from './assign-expenses-to-distribution.component';

describe('AssignExpensesToDistributionComponent', () => {
  let component: AssignExpensesToDistributionComponent;
  let fixture: ComponentFixture<AssignExpensesToDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignExpensesToDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignExpensesToDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
