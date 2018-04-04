import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsInvoicesComponent } from './payments-invoices.component';

describe('PaymentsInvoicesComponent', () => {
  let component: PaymentsInvoicesComponent;
  let fixture: ComponentFixture<PaymentsInvoicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentsInvoicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
