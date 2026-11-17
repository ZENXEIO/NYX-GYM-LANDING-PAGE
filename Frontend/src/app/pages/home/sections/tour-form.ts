import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  Injector,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnquiryState } from '../../../core/enquiry.state';
import { TourApiService, TourField } from '../../../core/tour-api.service';
import { site } from '../../../content/site';
import { environment } from '../../../../environments/environment';
import { indianMobile, normalisePhone, notInPast, todayIso } from './tour-form.validators';

type Status = 'idle' | 'sending' | 'success' | 'rate-limited' | 'unavailable';

/** Cloudflare Turnstile site key (public). Empty = no widget. A token so tests can turn it on. */
export const TURNSTILE_SITE_KEY = new InjectionToken<string>('TURNSTILE_SITE_KEY', {
  providedIn: 'root',
  factory: () => environment.turnstileSiteKey,
});

/** The subset of `window.turnstile` this form uses. */
export interface TurnstileApi {
  render(
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
    },
  ): string;
  reset(id?: string): void;
}

type TurnstileWindow = Window & { turnstile?: TurnstileApi };

/** Tour booking form (CLAUDE.md §10). */
@Component({
  selector: 'nyx-tour-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="border-line bg-monsoon/60 border p-6 md:p-10">
      <h3 id="tour-form-title" class="text-h3">{{ copy.heading }}</h3>

      @if (status() === 'success') {
        <div class="mt-8" role="status">
          <p class="text-body-lg">{{ copy.success }}</p>
          <button type="button" class="btn mt-8" (click)="startAgain()">
            {{ copy.startAgain }}
          </button>
        </div>
      } @else {
        <form
          class="mt-8 flex flex-col gap-6"
          [formGroup]="form"
          (ngSubmit)="submit()"
          novalidate
          aria-labelledby="tour-form-title"
        >
          <div>
            <label for="tour-name" class="text-label text-fg-muted">Name</label>
            <input
              id="tour-name"
              class="field"
              formControlName="name"
              autocomplete="name"
              [attr.aria-invalid]="invalid('name')"
              [attr.aria-describedby]="invalid('name') ? 'tour-name-error' : null"
            />
            @if (invalid('name')) {
              <p id="tour-name-error" class="error">{{ errorFor('name') }}</p>
            }
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <label for="tour-phone" class="text-label text-fg-muted">Mobile</label>
              <input
                id="tour-phone"
                class="field"
                type="tel"
                inputmode="tel"
                formControlName="phone"
                autocomplete="tel"
                placeholder="98200 12345"
                [attr.aria-invalid]="invalid('phone')"
                [attr.aria-describedby]="invalid('phone') ? 'tour-phone-error' : null"
              />
              @if (invalid('phone')) {
                <p id="tour-phone-error" class="error">{{ errorFor('phone') }}</p>
              }
            </div>
            <div>
              <label for="tour-email" class="text-label text-fg-muted">Email</label>
              <input
                id="tour-email"
                class="field"
                type="email"
                formControlName="email"
                autocomplete="email"
                [attr.aria-invalid]="invalid('email')"
                [attr.aria-describedby]="invalid('email') ? 'tour-email-error' : null"
              />
              @if (invalid('email')) {
                <p id="tour-email-error" class="error">{{ errorFor('email') }}</p>
              }
            </div>
          </div>

          <div>
            <label for="tour-date" class="text-label text-fg-muted">Preferred date</label>
            <input
              id="tour-date"
              class="field"
              type="date"
              formControlName="date"
              [attr.min]="minDate() || null"
              [attr.aria-invalid]="invalid('date')"
              [attr.aria-describedby]="invalid('date') ? 'tour-date-error' : null"
            />
            @if (invalid('date')) {
              <p id="tour-date-error" class="error">{{ errorFor('date') }}</p>
            }
          </div>

          <fieldset
            [attr.aria-invalid]="invalid('slot')"
            [attr.aria-describedby]="invalid('slot') ? 'tour-slot-error' : null"
          >
            <legend class="text-label text-fg-muted">Preferred time</legend>
            <div class="border-line mt-2 grid grid-cols-3 border">
              @for (s of copy.slots; track s.value; let first = $first) {
                <label class="slot" [class.border-l]="!first">
                  <!-- name + attr.value: a real native radio group (arrow keys, "1 of 3") -->
                  <input
                    type="radio"
                    class="sr-only"
                    name="slot"
                    formControlName="slot"
                    [value]="s.value"
                    [attr.value]="s.value"
                  />
                  <span>{{ s.label }}</span>
                </label>
              }
            </div>
            @if (invalid('slot')) {
              <p id="tour-slot-error" class="error">{{ errorFor('slot') }}</p>
            }
          </fieldset>

          <div>
            <label for="tour-interest" class="text-label text-fg-muted">Interested in</label>
            <select id="tour-interest" class="field appearance-none" formControlName="interest">
              @for (i of copy.interests; track i.value) {
                <option [value]="i.value">{{ i.label }}</option>
              }
            </select>
          </div>

          <!-- Honeypot: hidden from people, tempting to bots -->
          <div class="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label for="tour-company">Company</label>
            <input id="tour-company" formControlName="company" tabindex="-1" autocomplete="off" />
          </div>

          @if (turnstileEnabled) {
            <div #turnstile class="min-h-[65px]"></div>
          }

          @if (status() === 'rate-limited' || status() === 'unavailable') {
            <div role="alert" class="border-bronze border-l pl-4">
              <p>{{ status() === 'rate-limited' ? copy.rateLimited : copy.unavailable }}</p>
              <p class="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                <a class="link-line text-bronze-light" [href]="contact.phoneHref"
                  >{{ copy.fallbackCall }} {{ contact.phoneDisplay }}</a
                >
                <a
                  class="link-line text-bronze-light"
                  [href]="contact.whatsappHref"
                  rel="noopener"
                  target="_blank"
                  >{{ copy.fallbackWhatsapp }}</a
                >
              </p>
            </div>
          }

          <button
            type="submit"
            class="btn mt-2 w-full md:w-auto md:self-start"
            [disabled]="status() === 'sending'"
          >
            {{ status() === 'sending' ? copy.sending : copy.submit }}
          </button>
        </form>
      }
    </div>
  `,
  styles: `
    .field {
      display: block;
      width: 100%;
      min-height: 52px;
      margin-top: 8px;
      padding: 0 16px;
      background: var(--color-basalt);
      border: 1px solid var(--color-line);
      border-radius: 2px;
      color: var(--color-plaster);
      transition: border-color 600ms var(--ease-calm);
    }
    .field::placeholder {
      color: rgb(169 163 152 / 0.6);
    }
    .field:hover {
      border-color: rgb(237 230 218 / 0.3);
    }
    .field[aria-invalid='true'] {
      border-color: var(--color-bronze-light);
    }
    select.field {
      background-image:
        linear-gradient(45deg, transparent 50%, currentColor 50%),
        linear-gradient(135deg, currentColor 50%, transparent 50%);
      background-position:
        calc(100% - 22px) 50%,
        calc(100% - 17px) 50%;
      background-size: 5px 5px;
      background-repeat: no-repeat;
    }
    .error {
      margin-top: 8px;
      font-size: 0.9375rem;
      color: var(--color-bronze-light);
    }
    .slot {
      display: grid;
      place-items: center;
      min-height: 52px;
      cursor: pointer;
      border-color: var(--color-line);
      color: var(--color-plaster-muted);
      transition:
        background-color 600ms var(--ease-calm),
        color 600ms var(--ease-calm);
    }
    .slot:has(input:checked) {
      background: rgb(176 141 87 / 0.14);
      color: var(--color-plaster);
    }
    .slot:has(input:focus-visible) {
      outline: 2px solid var(--color-bronze);
      outline-offset: -2px;
    }
  `,
})
export class TourForm {
  protected readonly copy = site.visit.form;
  protected readonly contact = site.contact;
  protected readonly status = signal<Status>('idle');
  protected readonly submitted = signal(false);
  protected readonly minDate = signal('');

  private readonly turnstileSiteKey = inject(TURNSTILE_SITE_KEY);
  protected readonly turnstileEnabled = !!this.turnstileSiteKey;

  private readonly api = inject(TourApiService);
  private readonly enquiry = inject(EnquiryState);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private idempotencyKey = newKey();
  private turnstileToken = '';
  private turnstileId?: string;
  private readonly serverErrors = signal<Partial<Record<TourField, string>>>({});
  private readonly turnstileEl = viewChild<ElementRef<HTMLElement>>('turnstile');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    phone: ['', [Validators.required, indianMobile]],
    email: ['', [Validators.required, Validators.email]],
    date: ['', [Validators.required, notInPast()]],
    slot: ['', [Validators.required]],
    interest: ['tour'],
    company: [''],
  });

  constructor() {
    // Pre-fill from the membership "Enquire" buttons.
    effect(() => this.form.controls.interest.setValue(this.enquiry.interest()));

    afterNextRender(() => {
      this.minDate.set(todayIso());
      if (this.turnstileEnabled) this.loadTurnstile();
    });
  }

  protected invalid(field: TourField): boolean {
    const c = this.form.controls[field];
    return (c.invalid && (c.touched || this.submitted())) || !!this.serverErrors()[field];
  }

  protected errorFor(field: TourField): string {
    return this.serverErrors()[field] ?? this.copy.errors[field];
  }

  protected submit(): void {
    this.submitted.set(true);
    this.serverErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstError();
      return;
    }
    if (this.status() === 'sending') return;
    this.status.set('sending');

    const v = this.form.getRawValue();
    this.api
      .submit(
        { ...v, phone: normalisePhone(v.phone), turnstileToken: this.turnstileToken || undefined },
        this.idempotencyKey,
      )
      .subscribe((result) => {
        switch (result.kind) {
          case 'success':
            this.status.set('success');
            this.idempotencyKey = newKey();
            this.turnstileToken = ''; // the widget leaves the DOM with the form
            break;
          case 'invalid':
            this.status.set('idle');
            this.serverErrors.set(result.fields);
            this.resetTurnstile();
            this.focusFirstError();
            break;
          default:
            this.status.set(result.kind);
            this.resetTurnstile();
        }
      });
  }

  protected startAgain(): void {
    this.form.reset({ interest: this.enquiry.interest() });
    this.submitted.set(false);
    this.status.set('idle');
    // The form (and its Turnstile container) is rendered again: give it a new widget.
    if (this.turnstileEnabled) {
      afterNextRender(() => this.renderTurnstile(), { injector: this.injector });
    }
  }

  private focusFirstError(): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      { injector: this.injector },
    );
  }

  private loadTurnstile(): void {
    if ((window as TurnstileWindow).turnstile) return this.renderTurnstile();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => this.renderTurnstile();
    document.head.appendChild(s);
  }

  private renderTurnstile(): void {
    const el = this.turnstileEl()?.nativeElement;
    const turnstile = (window as TurnstileWindow).turnstile;
    if (!el || !turnstile) return;
    this.turnstileId = turnstile.render(el, {
      sitekey: this.turnstileSiteKey,
      theme: 'dark',
      callback: (token) => (this.turnstileToken = token),
      'expired-callback': () => (this.turnstileToken = ''),
    });
  }

  /** Turnstile tokens are single-use: every new attempt needs a fresh one. */
  private resetTurnstile(): void {
    this.turnstileToken = '';
    const turnstile = (window as TurnstileWindow).turnstile;
    if (turnstile && this.turnstileId !== undefined) turnstile.reset(this.turnstileId);
  }
}

function newKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
