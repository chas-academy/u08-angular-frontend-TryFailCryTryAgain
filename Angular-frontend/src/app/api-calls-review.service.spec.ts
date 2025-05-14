import { TestBed } from '@angular/core/testing';

import { ReviewService } from './api-calls-review.service';

describe('ApiCallsReviewService', () => {
  let service: ReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
