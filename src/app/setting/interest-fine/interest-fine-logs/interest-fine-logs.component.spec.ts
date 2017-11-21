import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestFineLogsComponent } from './interest-fine-logs.component';

describe('LogsComponent', () => {
  let component: InterestFineLogsComponent;
  let fixture: ComponentFixture<InterestFineLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterestFineLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestFineLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
