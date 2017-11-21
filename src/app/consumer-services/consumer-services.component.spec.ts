import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumerServicesComponent } from './consumer-services.component';

describe('ConsumerServicesComponent', () => {
  let component: ConsumerServicesComponent;
  let fixture: ComponentFixture<ConsumerServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumerServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumerServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
