import { IMAGE_CONFIG, IMAGE_LOADER } from '@angular/common';
import { EnvironmentProviders, Provider, Type } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IMAGE_WIDTHS, nyxImageLoader } from '../app.config';

export interface Rendered<T> {
  fixture: ComponentFixture<T>;
  el: HTMLElement;
  q: <E extends Element = HTMLElement>(selector: string) => E | null;
  qa: <E extends Element = HTMLElement>(selector: string) => E[];
  text: (selector?: string) => string;
  /** Wait for change detection + pending tasks (zoneless). */
  stable: () => Promise<void>;
}

/** Test-only helper: render a standalone component with the app's common providers. */
export async function render<T>(
  component: Type<T>,
  opts: {
    providers?: (Provider | EnvironmentProviders)[];
    inputs?: Record<string, unknown>;
    deferBlockBehavior?: DeferBlockBehavior;
  } = {},
): Promise<Rendered<T>> {
  TestBed.configureTestingModule({
    imports: [component],
    providers: [
      provideRouter([]),
      { provide: IMAGE_LOADER, useValue: nyxImageLoader },
      { provide: IMAGE_CONFIG, useValue: { breakpoints: IMAGE_WIDTHS } },
      ...(opts.providers ?? []),
    ],
    deferBlockBehavior: opts.deferBlockBehavior ?? DeferBlockBehavior.Playthrough,
  });
  const fixture = TestBed.createComponent(component);
  for (const [k, v] of Object.entries(opts.inputs ?? {})) fixture.componentRef.setInput(k, v);
  await fixture.whenStable();

  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    el,
    q: <E extends Element = HTMLElement>(s: string) => el.querySelector<E>(s),
    qa: <E extends Element = HTMLElement>(s: string) => Array.from(el.querySelectorAll<E>(s)),
    text: (s?: string) =>
      ((s ? el.querySelector(s) : el)?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    stable: () => fixture.whenStable(),
  };
}

/** Type into an input/select the way a person would (fires input + change + blur). */
export function fill(el: HTMLInputElement | HTMLSelectElement, value: string): void {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur'));
}
