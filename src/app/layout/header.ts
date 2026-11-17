import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { site } from '../content/site';

/** Floating nav capsule + full-screen menu dialog (CLAUDE.md §4, element 2). */
@Component({
  selector: 'nyx-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-5">
      <nav
        aria-label="Main"
        class="capsule border-line pointer-events-auto mx-auto flex h-14 max-w-[1040px] items-center justify-between rounded-[4px] border pr-2 pl-5 md:h-16 md:pr-3 md:pl-6"
        [class.is-solid]="scrolled()"
      >
        <a
          routerLink="/"
          class="wordmark inline-flex min-h-11 items-center text-[1.0625rem]"
          aria-label="NYX, home"
          >NYX</a
        >

        <span class="text-label text-plaster-muted hidden lg:block">{{ site.descriptor }}</span>

        <div class="flex items-center gap-2 md:gap-3">
          <a routerLink="/" fragment="visit" class="btn hidden min-h-11 px-5 md:inline-flex">{{
            site.header.cta
          }}</a>
          <button
            #trigger
            type="button"
            class="flex min-h-11 min-w-11 items-center justify-center gap-3 px-3"
            aria-haspopup="dialog"
            [attr.aria-expanded]="open()"
            aria-controls="site-menu"
            (click)="openMenu()"
          >
            <span class="text-label hidden md:inline">{{ site.header.menu }}</span>
            <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
              <path d="M0 1h22M6 9h16" stroke="currentColor" stroke-width="1.25" />
            </svg>
            <span class="sr-only md:hidden">{{ site.header.menu }}</span>
          </button>
        </div>
      </nav>
    </header>

    <dialog
      #menu
      id="site-menu"
      aria-label="Site menu"
      class="menu bg-basalt text-plaster fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none p-0"
      (close)="onClosed()"
      (cancel)="open.set(false)"
    >
      <div class="site-container flex h-full flex-col pt-4 pb-8 md:pt-5">
        <div class="flex h-14 items-center justify-between pl-5 md:h-16 md:pl-6">
          <span class="wordmark text-[1.0625rem]" aria-hidden="true">NYX</span>
          <button
            type="button"
            class="flex min-h-11 min-w-11 items-center justify-center gap-3 px-3"
            (click)="closeMenu()"
          >
            <span class="text-label">{{ site.header.close }}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.25" />
            </svg>
          </button>
        </div>

        <ul class="mt-auto mb-auto flex flex-col gap-1 pl-5 md:pl-6">
          @for (link of site.nav; track link.fragment) {
            <li>
              <a
                routerLink="/"
                [fragment]="link.fragment"
                class="menu-link text-h2 inline-block py-2"
                (click)="closeMenu()"
                >{{ link.label }}</a
              >
            </li>
          }
        </ul>

        <div
          class="border-line text-plaster-muted flex flex-col gap-3 border-t pt-6 pl-5 md:flex-row md:justify-between md:pl-6"
        >
          <a class="link-line w-fit" [href]="site.contact.phoneHref">{{
            site.contact.phoneDisplay
          }}</a>
          <span>{{ site.contact.area }}, {{ site.hoursShort.toLowerCase() }}</span>
          <a class="link-line w-fit" [href]="site.contact.instagram" rel="noopener" target="_blank"
            >Instagram</a
          >
        </div>
      </div>
    </dialog>
  `,
  styles: `
    .capsule {
      transition:
        background-color 900ms var(--ease-calm),
        backdrop-filter 900ms var(--ease-calm);
    }
    .capsule.is-solid {
      background-color: rgb(22 26 29 / 0.72);
      -webkit-backdrop-filter: blur(14px);
      backdrop-filter: blur(14px);
    }
    .menu::backdrop {
      background: var(--color-basalt);
    }
    .menu-link {
      transition: color 900ms var(--ease-calm);
    }
    .menu-link:hover {
      color: var(--color-bronze-light);
    }
    @media (prefers-reduced-motion: no-preference) {
      .menu[open] {
        animation: nyx-dusk 700ms var(--ease-calm);
      }
    }
  `,
})
export class Header {
  protected readonly site = site;
  protected readonly scrolled = signal(false);
  protected readonly open = signal(false);

  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const onScroll = () => this.scrolled.set(window.scrollY > 24);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }

  protected openMenu(): void {
    // showModal() traps focus, makes the page inert and closes on Esc natively.
    this.menu().nativeElement.showModal();
    document.documentElement.style.overflow = 'hidden';
    this.open.set(true);
  }

  protected closeMenu(): void {
    this.menu().nativeElement.close();
  }

  protected onClosed(): void {
    document.documentElement.style.overflow = '';
    this.open.set(false);
    this.trigger().nativeElement.focus({ preventScroll: true });
  }
}
