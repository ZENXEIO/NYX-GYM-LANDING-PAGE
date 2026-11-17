import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { site } from '../content/site';

@Component({
  selector: 'nyx-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-line bg-basalt border-t pt-20 pb-10 md:pt-28">
      <div class="site-container">
        <div class="site-grid gap-y-12">
          <div class="col-span-4 md:col-span-5">
            <a routerLink="/" class="wordmark text-[2rem]" aria-label="NYX, home">NYX</a>
            <p class="text-plaster-muted mt-6 max-w-[32ch]">{{ site.footer.tagline }}</p>
          </div>

          <div class="col-span-2 md:col-span-3 md:col-start-7">
            <h2 class="text-label text-plaster-muted">Visit</h2>
            <address class="mt-4 not-italic">
              @for (line of site.contact.addressLines; track line) {
                <span class="block">{{ line }}</span>
              }
            </address>
            @if (site.contact.placeholder) {
              <p class="text-label text-bronze mt-3">Placeholder address</p>
            }
          </div>

          <div class="col-span-2 md:col-span-3">
            <h2 class="text-label text-plaster-muted">Contact</h2>
            <ul class="mt-4 flex flex-col gap-2">
              <li>
                <a class="link-line" [href]="site.contact.phoneHref">{{
                  site.contact.phoneDisplay
                }}</a>
              </li>
              <li>
                <a class="link-line" [href]="'mailto:' + site.contact.email">{{
                  site.contact.email
                }}</a>
              </li>
              <li>
                <a
                  class="link-line"
                  [href]="site.contact.whatsappHref"
                  rel="noopener"
                  target="_blank"
                  >WhatsApp</a
                >
              </li>
              <li>
                <a class="link-line" [href]="site.contact.instagram" rel="noopener" target="_blank"
                  >Instagram</a
                >
              </li>
            </ul>
          </div>
        </div>

        <div
          class="border-line text-plaster-muted mt-20 flex flex-col gap-4 border-t pt-6 text-sm md:flex-row md:items-center md:justify-between"
        >
          <p>© {{ year }} NYX. All rights reserved.</p>
          <ul class="flex gap-6">
            @for (l of site.footer.legal; track l.path) {
              <li>
                <a class="link-line" [routerLink]="l.path">{{ l.label }}</a>
              </li>
            }
          </ul>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly site = site;
  protected readonly year = new Date().getFullYear();
}
