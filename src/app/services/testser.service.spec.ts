import { TestBed } from '@angular/core/testing';

import { TestserService } from './testser.service';

describe('TestserService', () => {
  let service: TestserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
