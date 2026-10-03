import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { Invite } from '../game/cloud';
import { parseInvite } from '../game/invite';
import { SharingStore } from '../game/sharing.store';
import { Screen } from './screen';

/** The browser's own barcode reader, where there is one (not on iPhone). */
type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type DetectorClass = new (options: { formats: string[] }) => Detector;

/** Frames are read at this width: enough for a code across the table, cheap to decode. */
const READ_WIDTH = 480;

/**
 * Scanning a mesa's QR from inside the app. A QR scanned with the phone's own
 * camera opens the browser, never the installed app (always so on an iPhone),
 * so the app reads the code itself and goes straight to joining.
 */
@Component({
  selector: 'app-scan-screen',
  imports: [Screen],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.join.scanTitle" (closed)="stop()">
      <p class="lead">{{ copy.join.scanLead }}</p>
      <div class="frame">
        <video
          #video
          class="video"
          playsinline
          muted
          autoplay
          [attr.aria-label]="copy.join.scanVideo"
        ></video>
        <!-- The square the code should sit in. -->
        <span class="aim" aria-hidden="true"></span>
      </div>
      <p class="message" role="status" [class.error]="problem() !== null">{{ message() }}</p>
    </app-screen>
  `,
  styles: `
    .lead,
    .message {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 40ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .message:empty {
      display: none;
    }

    .message.error {
      color: var(--c-danger);
    }

    .frame {
      position: relative;
      align-self: center;
      width: min(100%, 360px);
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--c-ink);
      border: 2px solid var(--c-line);
    }

    .video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .aim {
      position: absolute;
      inset: 18%;
      border: 3px solid var(--c-on-ink);
      pointer-events: none;
    }
  `,
})
export class ScanScreen {
  protected readonly copy = copy;
  private readonly screen = viewChild.required(Screen);
  private readonly sharing = inject(SharingStore);
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  /** A mesa's invitation, read from its code. */
  readonly scanned = output<Invite>();

  /** Whether this browser can use the camera at all. */
  static readonly available =
    typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function';

  protected readonly starting = signal(false);
  protected readonly problem = signal<'denied' | 'unavailable' | 'wrong' | null>(null);
  protected readonly message = computed(() => {
    switch (this.problem()) {
      case 'denied':
        return copy.join.scanDenied;
      case 'unavailable':
        return copy.join.scanUnavailable;
      case 'wrong':
        return copy.join.scanWrong;
      default:
        return this.starting() ? copy.join.scanStarting : '';
    }
  });

  private stream: MediaStream | null = null;
  private frame = 0;
  private reading = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /** Called from the tap, so the camera prompt belongs to it. */
  open(): void {
    // Joining follows a scan: Firebase loads while the camera looks for the code.
    this.sharing.warmUp();
    this.problem.set(null);
    this.screen().open();
    void this.start();
  }

  protected stop(): void {
    cancelAnimationFrame(this.frame);
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    const video = this.video().nativeElement;
    video.srcObject = null;
  }

  private async start(): Promise<void> {
    if (!ScanScreen.available) {
      this.problem.set('unavailable');
      return;
    }
    this.starting.set(true);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
    } catch (error) {
      this.starting.set(false);
      const name = (error as { name?: string }).name;
      this.problem.set(
        name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable',
      );
      return;
    }
    // Closed while the camera was being asked for.
    if (!this.screen().isOpen) {
      this.stop();
      return;
    }
    const video = this.video().nativeElement;
    video.srcObject = this.stream;
    await video.play().catch(() => {});
    this.starting.set(false);
    await this.read(video);
  }

  /** Reads frames until one holds a mesa's code. */
  private async read(video: HTMLVideoElement): Promise<void> {
    const Native = (globalThis as { BarcodeDetector?: DetectorClass }).BarcodeDetector;
    const detector = Native ? new Native({ formats: ['qr_code'] }) : null;
    // Where the browser has no reader of its own (iPhone), a small one is loaded.
    const decode = detector === null ? (await import('jsqr')).default : null;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    const tick = async () => {
      if (this.stream === null || context === null) return;
      if (!this.reading && video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        this.reading = true;
        try {
          const text = await this.decodeFrame(video, canvas, context, detector, decode);
          if (text !== null && this.found(text)) return;
        } finally {
          this.reading = false;
        }
      }
      this.frame = requestAnimationFrame(() => void tick());
    };
    this.frame = requestAnimationFrame(() => void tick());
  }

  private async decodeFrame(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    detector: Detector | null,
    decode:
      ((data: Uint8ClampedArray, width: number, height: number) => { data: string } | null) | null,
  ): Promise<string | null> {
    if (detector !== null) {
      const codes = await detector.detect(video).catch(() => []);
      return codes[0]?.rawValue ?? null;
    }
    const scale = Math.min(1, READ_WIDTH / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    return decode?.(image.data, image.width, image.height)?.data ?? null;
  }

  /** A code was read: a mesa's goes to joining; any other says so and keeps looking. */
  private found(text: string): boolean {
    const hash = text.indexOf('#');
    const invite = hash < 0 ? null : parseInvite(text.slice(hash));
    if (invite === null) {
      this.problem.set('wrong');
      return false;
    }
    this.stop();
    this.screen().close();
    this.scanned.emit(invite);
    return true;
  }
}
