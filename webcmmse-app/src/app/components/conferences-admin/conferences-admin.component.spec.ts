import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferencesAdminComponent } from './conferences-admin.component';

describe('ConferencesAdminComponent', () => {
  let component: ConferencesAdminComponent;
  let fixture: ComponentFixture<ConferencesAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConferencesAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConferencesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
