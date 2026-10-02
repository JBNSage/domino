import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Member } from '../game/cloud';
import { GameStore } from '../game/game.store';
import { SharingStore } from '../game/sharing.store';
import { TablesStore } from '../game/tables.store';
import { Screen } from './screen';
import { Sheet } from './sheet';

/**
 * Sharing a mesa, for its owners: the link three ways (WhatsApp, copied, a QR
 * to scan across the table), the people in it and what each may do, and a new
 * link when the old one should stop letting people in.
 */
@Component({
  selector: 'app-share-screen',
  imports: [Screen, Sheet, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.share.title">
      @if (mesa(); as mesa) {
        <p class="lead">{{ copy.share.lead(mesa.name) }}</p>

        <!-- Dark on white whatever the appearance, so any camera reads it. -->
        <div class="qr" [class.qr--ready]="link() !== null">
          <canvas #qr role="img" [attr.aria-label]="copy.share.qr(mesa.name)"></canvas>
          @if (link() === null) {
            <p class="qr-wait">{{ copy.share.preparing }}</p>
          }
        </div>

        <div class="send">
          <a
            class="slab lean whatsapp"
            target="_blank"
            rel="noopener"
            [attr.href]="whatsapp()"
            [attr.aria-disabled]="link() === null ? 'true' : null"
            [class.off]="link() === null"
          >
            <span class="slab__label" [appFitText]="copy.share.whatsapp">{{
              copy.share.whatsapp
            }}</span>
          </a>
          <div class="slab-row">
            <button
              type="button"
              class="slab slab--compact lean"
              [disabled]="link() === null"
              (click)="copyLink()"
            >
              <span class="slab__label" [appFitText]="copy.share.copy">{{ copy.share.copy }}</span>
            </button>
            @if (canShare) {
              <button
                type="button"
                class="slab slab--compact lean"
                [disabled]="link() === null"
                (click)="shareNative()"
              >
                <span class="slab__label" [appFitText]="copy.share.native">{{
                  copy.share.native
                }}</span>
              </button>
            }
          </div>
          <p class="status" role="status">{{ status() }}</p>
          @if (showLink()) {
            <!-- Where copying is not allowed, the link itself, to be selected by hand. -->
            <p class="link">{{ link() }}</p>
          }
        </div>

        <section class="part" aria-labelledby="share-people">
          <h3 class="heading numerals" id="share-people">
            {{ copy.share.people(members().length) }}
          </h3>
          <ul class="people">
            @for (member of members(); track member.uid) {
              <li class="person lean">
                <span class="who">
                  <span class="name">{{ member.name }}</span>
                  @if (member.uid === me()) {
                    <span class="you">{{ copy.share.you }} · {{ copy.share.owner }}</span>
                  }
                </span>
                @if (member.uid !== me()) {
                  <div class="roles">
                    <button
                      type="button"
                      role="switch"
                      class="role"
                      [attr.aria-checked]="member.owner"
                      [attr.aria-label]="copy.share.ownerA11y(member.name)"
                      (click)="sharing.setRole(mesa.id, member.uid, { owner: !member.owner })"
                    >
                      <span class="box lean" [class.box--on]="member.owner">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7" />
                        </svg>
                      </span>
                      <span class="role-label">{{ copy.share.owner }}</span>
                    </button>
                    <button
                      type="button"
                      role="switch"
                      class="role"
                      [attr.aria-checked]="member.owner || member.scores"
                      [attr.aria-label]="copy.share.scoresA11y(member.name)"
                      [disabled]="member.owner"
                      (click)="sharing.setRole(mesa.id, member.uid, { scores: !member.scores })"
                    >
                      <span class="box lean" [class.box--on]="member.owner || member.scores">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7" />
                        </svg>
                      </span>
                      <span class="role-label">{{ copy.share.scores }}</span>
                    </button>
                    <button
                      type="button"
                      class="slab slab--compact slab--warn lean remove"
                      [attr.aria-label]="copy.share.removeA11y(member.name)"
                      (click)="askRemove(member)"
                    >
                      <span class="slab__label" [appFitText]="copy.share.remove">{{
                        copy.share.remove
                      }}</span>
                    </button>
                  </div>
                }
              </li>
            }
          </ul>
          <p class="note">{{ copy.share.ownerHelp }}. {{ copy.share.scoresHelp }}.</p>
        </section>

        <section class="part">
          <button type="button" class="slab slab--compact lean renew" (click)="newLink(mesa.id)">
            <span class="slab__label" [appFitText]="copy.share.newLink">{{
              copy.share.newLink
            }}</span>
          </button>
          <p class="note">{{ copy.share.newLinkHelp }}</p>
        </section>
      }
    </app-screen>

    <!-- Taking someone out is not undone: it asks first. -->
    <app-sheet #ask accent="var(--c-danger)" labelledBy="share-remove-title">
      <h2 class="title" id="share-remove-title">
        {{ copy.share.removeTitle(removing()?.name ?? '') }}
      </h2>
      <p class="facts">{{ copy.share.removeBody }}</p>
      <div class="actions">
        <button type="button" class="slab slab--danger lean" (click)="remove()">
          <span class="slab__label" [appFitText]="copy.share.remove">{{ copy.share.remove }}</span>
        </button>
        <button type="button" class="slab slab--compact lean" (click)="ask.close()">
          <span class="slab__label" [appFitText]="copy.common.cancel">{{
            copy.common.cancel
          }}</span>
        </button>
      </div>
    </app-sheet>
  `,
  styles: `
    .lead,
    .note,
    .status,
    .link {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 40ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .status:empty {
      display: none;
    }

    .status {
      color: var(--c-text);
    }

    .link {
      color: var(--c-text);
      font-size: var(--t-meta);
      overflow-wrap: anywhere;
      user-select: all;
      -webkit-user-select: all;
    }

    .qr {
      align-self: center;
      display: grid;
      place-items: center;
      width: min(100%, 272px);
      aspect-ratio: 1;
      padding: var(--s-lg);
      background: #fff;
      border: 2px solid var(--c-line);
    }

    .qr canvas {
      width: 100%;
      height: 100%;
      grid-area: 1 / 1;
    }

    .qr-wait {
      grid-area: 1 / 1;
      margin: 0;
      color: #4a525b;
      text-align: center;
    }

    .send {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
    }

    .whatsapp {
      --fill: var(--c-text);
      --edge: transparent;
      --label: var(--c-ground);

      margin: 0 var(--s-sm);
      text-decoration: none;
    }

    .whatsapp.off {
      --fill: var(--c-raised);
      --label: var(--c-muted);
      pointer-events: none;
    }

    .part {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
    }

    .heading {
      margin: 0;
      padding: 0 var(--s-sm);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .people {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .person {
      --fill: var(--c-surface);
      --lean-inset: 8px;

      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--s-xs) var(--s-md);
      min-height: calc(var(--min-target) + 12px);
      padding: var(--s-sm) min(var(--s-xl), 6vw);
    }

    .who {
      flex: 1 1 8rem;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }

    .you {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .roles {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--s-xs) var(--s-sm);
    }

    .role {
      display: flex;
      align-items: center;
      gap: var(--s-sm);
      min-height: var(--min-target);
      padding: 0 var(--s-xs);
      border: 0;
      background: none;
      color: var(--c-text);
    }

    .role:disabled {
      color: var(--c-muted);
      cursor: default;
    }

    .role-label {
      font: italic 800 var(--t-compact) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .box {
      --fill: transparent;
      --edge: var(--c-line);
      --lean-inset: 3px;

      flex: none;
      display: grid;
      place-items: center;
      width: 40px;
      height: 32px;
    }

    .box--on {
      --fill: var(--c-text);
      --edge: transparent;
    }

    .box svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--c-ground);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0;
    }

    .box--on svg {
      opacity: 1;
    }

    .remove {
      padding: 0 var(--s-md);
    }

    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
      overflow-wrap: anywhere;
    }

    .facts {
      margin: 0;
      max-width: 65ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
      padding: 0 var(--s-sm);
    }

    .renew {
      align-self: flex-start;
      max-width: calc(100% - var(--s-lg));
      margin: 0 var(--s-sm);
    }
  `,
})
export class ShareScreen {
  protected readonly copy = copy;
  protected readonly sharing = inject(SharingStore);
  private readonly tables = inject(TablesStore);
  private readonly store = inject(GameStore);
  private readonly screen = viewChild.required(Screen);
  private readonly ask = viewChild.required<Sheet>('ask');
  protected readonly removing = signal<Member | null>(null);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('qr');

  protected readonly canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  private readonly id = signal<string | null>(null);
  protected readonly status = signal('');
  protected readonly showLink = signal(false);

  protected readonly mesa = computed(
    () => this.tables.tables().tables.find((table) => table.id === this.id()) ?? null,
  );
  protected readonly me = computed(() => this.mesa()?.shared?.me ?? null);
  protected readonly link = computed(() => {
    const id = this.id();
    // Read through the mesa, so the link follows a new code.
    return id === null || this.mesa()?.shared?.invite == null ? null : this.sharing.link(id);
  });
  protected readonly whatsapp = computed(() => {
    const link = this.link();
    const mesa = this.mesa();
    if (link === null || mesa === null) return null;
    return `https://wa.me/?text=${encodeURIComponent(copy.share.message(mesa.name, link))}`;
  });

  /** Owners first, then in the order they joined. */
  protected readonly members = computed<Member[]>(() =>
    [...(this.mesa()?.shared?.members ?? [])].sort(
      (one, other) => Number(other.owner) - Number(one.owner) || one.joinedAt - other.joinedAt,
    ),
  );

  constructor() {
    effect(() => {
      const link = this.link();
      const canvas = this.canvas()?.nativeElement;
      if (link === null || canvas === undefined) return;
      untracked(() => void this.draw(canvas, link));
    });
    // Once this phone no longer owns the mesa, or it is gone, there is nothing to share here.
    effect(() => {
      if (this.id() !== null && !this.mesa()?.shared?.owner) untracked(() => this.screen().close());
    });
  }

  open(id: string): void {
    this.id.set(id);
    this.status.set('');
    this.showLink.set(false);
    this.screen().open();
  }

  protected async copyLink(): Promise<void> {
    const link = this.link();
    if (link === null) return;
    try {
      await navigator.clipboard.writeText(link);
      this.status.set(copy.share.copied);
    } catch {
      this.status.set(copy.share.copyFailed);
      this.showLink.set(true);
    }
  }

  protected async shareNative(): Promise<void> {
    const link = this.link();
    const mesa = this.mesa();
    if (link === null || mesa === null) return;
    try {
      await navigator.share({
        title: mesa.name,
        text: copy.share.message(mesa.name, ''),
        url: link,
      });
    } catch {
      // Closing the share sheet is not an error worth showing.
    }
  }

  protected askRemove(member: Member): void {
    this.removing.set(member);
    this.ask().open();
  }

  protected remove(): void {
    const id = this.id();
    const member = this.removing();
    this.ask().close();
    if (id === null || member === null) return;
    this.sharing.removeMember(id, member.uid);
    this.store.announce(copy.share.removed(member.name));
  }

  protected newLink(id: string): void {
    this.sharing.newLink(id);
    this.status.set(copy.share.newLinkDone);
  }

  private async draw(canvas: HTMLCanvasElement, link: string): Promise<void> {
    const qr = await import('qrcode');
    await qr.toCanvas(canvas, link, {
      margin: 0,
      width: 480,
      errorCorrectionLevel: 'M',
      color: { dark: '#0e1114', light: '#ffffff' },
    });
  }
}
