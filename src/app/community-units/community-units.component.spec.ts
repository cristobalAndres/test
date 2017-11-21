import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityUnitsComponent } from './community-units.component';

describe('CommunityUnitsComponent', () => {
  let component: CommunityUnitsComponent;
  let fixture: ComponentFixture<CommunityUnitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityUnitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
