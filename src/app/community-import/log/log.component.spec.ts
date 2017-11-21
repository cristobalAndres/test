import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityImportLogComponent } from './log.component';

describe('LogComponent', () => {
  let component: CommunityImportLogComponent;
  let fixture: ComponentFixture<CommunityImportLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityImportLogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityImportLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
