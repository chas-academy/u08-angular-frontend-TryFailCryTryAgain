import { TestBed } from '@angular/core/testing';

import { ApiCallsOrderService } from './api-calls-order.service';

describe('ApiCallsOrderService', () => {
  let service: ApiCallsOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiCallsOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
