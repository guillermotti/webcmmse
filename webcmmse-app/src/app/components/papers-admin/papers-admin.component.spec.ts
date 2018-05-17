import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PapersAdminComponent } from './papers-admin.component';

describe('PapersAdminComponent', () => {
  let component: PapersAdminComponent;
  let fixture: ComponentFixture<PapersAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PapersAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PapersAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
