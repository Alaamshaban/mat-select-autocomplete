import { TestBed } from '@angular/core/testing';

import { SelectAutocompleteService } from './select-autocomplete.service';

describe('SelectAutocompleteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SelectAutocompleteService = TestBed.inject(SelectAutocompleteService);
    expect(service).toBeTruthy();
  });
});
