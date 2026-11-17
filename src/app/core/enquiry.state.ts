import { Injectable, signal } from '@angular/core';
import { TierId } from '../content/site';

/** Which membership the visitor last chose "Enquire" on; pre-fills the tour form. */
@Injectable({ providedIn: 'root' })
export class EnquiryState {
  readonly interest = signal<TierId | 'tour'>('tour');
}
