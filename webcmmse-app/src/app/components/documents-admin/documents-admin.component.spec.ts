import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsAdminComponent } from './documents-admin.component';

describe('DocumentsAdminComponent', () => {
  let component: DocumentsAdminComponent;
  let fixture: ComponentFixture<DocumentsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
