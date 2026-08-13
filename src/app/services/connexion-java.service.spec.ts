import { TestBed } from '@angular/core/testing';

import { ConnexionJavaService } from './connexion-java.service';

describe('ConnexionJavaService', () => {
  let service: ConnexionJavaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnexionJavaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
