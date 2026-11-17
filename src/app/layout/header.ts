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
import { Router, RouterLink } from '@angular/router';
import { site } from '../content/site';

/** Ids of every homepage section. Cross-page jumps wait until all exist, so nothing shifts. */
const HOME_SECTIONS = ['club', 'facilities', 'training', 'membership', 'testimonials', 'visit'];

/**
 * Floating nav capsule + a compact menu panel that drops down beneath it
 * (CLAUDE.md §4, element 2). Menu items scroll to homepage sections; they
 * never open a separate page.
 */
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
          <a
            href="/#visit"
            class="btn hidden min-h-11 px-5 md:inline-flex"
            (click)="go($event, 'visit')"
            >{{ site.header.cta }}</a
          >
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

    <!-- Modal for focus trap, Esc and inert page (CLAUDE.md §11), styled as a
         drop-down panel so the page stays visible behind it. -->
    <dialog
      #menu
      id="site-menu"
      aria-label="Site menu"
      class="menu bg-basalt text-plaster border-line rounded-[4px] border p-0"
      (close)="onClosed()"
      (cancel)="open.set(false)"
    >
      <div class="flex flex-col px-6 pt-3 pb-6">
        <div class="flex items-center justify-between">
          <span class="text-label text-plaster-muted">{{ site.header.menu }}</span>
          <button
            type="button"
            class="-mr-3 flex min-h-11 min-w-11 items-center justify-center gap-3 px-3"
            (click)="closeMenu()"
          >
            <span class="text-label">{{ site.header.close }}</span>
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.25" />
            </svg>
          </button>
        </div>

        <ul class="divide-line border-line mt-2 divide-y border-y">
          @for (link of site.nav; track link.fragment) {
            <li>
              <a
                [href]="'/#' + link.fragment"
                class="menu-link text-h3 flex min-h-14 items-center justify-between gap-4 py-3"
                (click)="go($event, link.fragment)"
              >
                <span>{{ link.label }}</span>
                <svg
                  class="menu-arrow text-bronze shrink-0"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path
                    d="M6 1v10M2 7l4 4 4-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                </svg>
              </a>
            </li>
          }
        </ul>

        <div
          class="text-plaster-muted mt-5 flex items-center justify-between gap-4 text-[0.9375rem]"
        >
          <a class="link-line" [href]="site.contact.phoneHref">{{ site.contact.phoneDisplay }}</a>
          <a class="link-line" [href]="site.contact.instagram" rel="noopener" target="_blank"
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
      background-color: color-mix(in srgb, var(--color-basalt) 72%, transparent);
      -webkit-backdrop-filter: blur(14px);
      backdrop-filter: blur(14px);
    }
    /* Panel just under the capsule: full width less the gutters on phones,
       a narrow card aligned to the capsule's right edge from 768px. */
    .menu {
      position: fixed;
      inset: 80px 16px auto 16px;
      margin: 0;
      width: auto;
      max-width: none;
      max-height: calc(100dvh - 96px);
      overflow-y: auto;
    }
    @media (min-width: 768px) {
      .menu {
        inset: 92px max(32px, calc((100vw - 1040px) / 2)) auto auto;
        width: 22rem;
      }
    }
    .menu::backdrop {
      background: color-mix(in srgb, var(--color-basalt) 45%, transparent);
    }
    .menu-link {
      transition: color 900ms var(--ease-calm);
    }
    .menu-link:hover,
    .menu-link:focus-visible {
      color: var(--color-bronze-light);
    }
    .menu-arrow {
      opacity: 0;
      transition: opacity 900ms var(--ease-calm);
    }
    .menu-link:hover .menu-arrow,
    .menu-link:focus-visible .menu-arrow {
      opacity: 1;
    }
    @media (prefers-reduced-motion: no-preference) {
      .menu[open] {
        animation: menu-drop 700ms var(--ease-calm);
      }
    }
    @keyframes menu-drop {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
  `,
})
export class Header {
  protected readonly site = site;
  protected readonly scrolled = signal(false);
  protected readonly open = signal(false);

  private readonly router = inject(Router);
  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const onScroll = () => this.scrolled.set(window.scrollY > 24);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

      // A click on the backdrop lands on the <dialog> itself: close. Mouse-only
      // convenience; keyboard users close with Esc (native) or the Close button.
      const dialog = this.menu().nativeElement;
      const onBackdrop = (e: MouseEvent) => {
        if (e.target === dialog) this.closeMenu();
      };
      dialog.addEventListener('click', onBackdrop);
      destroyRef.onDestroy(() => dialog.removeEventListener('click', onBackdrop));
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

  /**
   * Scroll to a homepage section. On the homepage it scrolls in place
   * (smoothly, unless reduced motion is on); from /privacy or /terms it goes
   * back to the homepage first. The href stays a real link, so it also works
   * without JavaScript and with Ctrl/Cmd-click.
   */
  protected go(event: MouseEvent, fragment: string): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (this.menu().nativeElement.open) {
      this.menu().nativeElement.close();
      // Unlock scrolling now; the dialog's close event only fires a task later.
      document.documentElement.style.overflow = '';
    }

    const target = document.getElementById(fragment);
    if (target) {
      target.scrollIntoView({ block: 'start' });
      return;
    }
    this.router.navigate(['/']).then(() => this.scrollWhenReady(fragment));
  }

  /** After returning to the homepage, wait until every section has rendered, then jump. */
  private scrollWhenReady(fragment: string, deadline = performance.now() + 4000): void {
    const ready = HOME_SECTIONS.every((id) => document.getElementById(id));
    if (ready) {
      requestAnimationFrame(() =>
        document.getElementById(fragment)?.scrollIntoView({ block: 'start', behavior: 'instant' }),
      );
    } else if (performance.now() < deadline) {
      requestAnimationFrame(() => this.scrollWhenReady(fragment, deadline));
    }
  }
}
