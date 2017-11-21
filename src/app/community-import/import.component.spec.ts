import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { CommunityImportComponent } from './import.component';
import { CommunityImportService } from './import.service';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions, Http } from '@angular/http';
import { Router } from '@angular/router';

describe('CommunityImportComponent', () => {
  let component: CommunityImportComponent;
  let fixture: ComponentFixture<CommunityImportComponent>;
  let communityImportService: CommunityImportService;
  let router: Router;
  let mockBackend: MockBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommunityImportService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend: MockBackend, options: BaseRequestOptions) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        }
      ],
      declarations: [
        CommunityImportComponent
      ]
    });
    fixture = TestBed.createComponent(CommunityImportComponent);
  });

  beforeEach(inject([CommunityImportService, MockBackend, Router],
    (s: CommunityImportService, mb: MockBackend, r: Router) => {
      communityImportService = s;
      router = r;
      mockBackend = mb;
      component = fixture.componentInstance;
      // fixture.detectChanges();
    }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be instance of Subject', () => {
    expect(component.isUploading).isPrototypeOf(Boolean);
  });
});

