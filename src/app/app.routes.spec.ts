import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { Home } from './pages/home/home';
import { Legal } from './pages/legal/legal';

describe('routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
  });

  it('defines the homepage and the two legal pages', () => {
    expect(routes.map((r) => r.path)).toEqual(['', 'privacy', 'terms', '**']);
  });

  it('lazy-loads every page (no page code in the initial bundle)', () => {
    for (const r of routes.filter((x) => x.path !== '**')) {
      expect(r.loadComponent).toBeTypeOf('function');
      expect(r.component).toBeUndefined();
    }
  });

  it('"/" renders the homepage', async () => {
    const harness = await RouterTestingHarness.create();
    const home = await harness.navigateByUrl('/', Home);
    expect(home).toBeInstanceOf(Home);
  });

  it.each(['privacy', 'terms'] as const)('"/%s" renders the matching legal page', async (kind) => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/${kind}`, Legal);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(
      kind === 'privacy' ? 'Privacy' : 'Terms',
    );
  });

  it('unknown URLs redirect to the homepage instead of a dead end', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/does-not-exist');
    expect(TestBed.inject(Location).path()).toBe('');
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
