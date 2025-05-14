import { TestBed } from '@angular/core/testing';

import { ApiCallsUsersService } from './api-calls-users.service';

describe('ApiCallsUsersService', () => {
  let service: ApiCallsUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiCallsUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
