import { TestBed } from '@angular/core/testing';
import { EnquiryState } from './enquiry.state';

describe('EnquiryState', () => {
  it('starts as a plain tour enquiry', () => {
    expect(TestBed.inject(EnquiryState).interest()).toBe('tour');
  });

  it('is one shared instance, so membership and the form see the same choice', () => {
    const a = TestBed.inject(EnquiryState);
    a.interest.set('eclipse');
    expect(TestBed.inject(EnquiryState).interest()).toBe('eclipse');
  });
});
