import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordReadingComponent } from './record-reading.component';

describe('ReadRegisterComponent', () => {
  let component: RecordReadingComponent;
  let fixture: ComponentFixture<RecordReadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordReadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordReadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
