import { TestBed } from '@angular/core/testing';

import { ApiCallsReviewService } from './api-calls-review.service';

describe('ApiCallsReviewService', () => {
  let service: ApiCallsReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiCallsReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
