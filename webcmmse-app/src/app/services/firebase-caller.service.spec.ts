import { TestBed, inject } from '@angular/core/testing';

import { FirebaseCallerService } from './firebase-caller.service';

describe('FirebaseCallerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FirebaseCallerService]
    });
  });

  it('should be created', inject([FirebaseCallerService], (service: FirebaseCallerService) => {
    expect(service).toBeTruthy();
  }));
});
