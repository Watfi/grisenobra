import {
  Component,
  Input,
  signal,
  ElementRef,
  ViewChild,
  afterNextRender,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface PolaroidImage {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-polaroid-stack',
  standalone: true,
  template: `
    <div #container class="relative w-full h-full flex items-center justify-center overflow-hidden">
      @for (img of images; track $index) {
        <div
          class="polaroid-card absolute"
          [style.z-index]="images.length - $index"
          [attr.data-index]="$index">
          <div class="bg-white p-3 md:p-4 shadow-xl rounded-sm"
               style="box-shadow: 0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);">
            <img
              [src]="img.src"
              [alt]="img.alt"
              class="w-36 h-48 sm:w-48 sm:h-60 md:w-56 md:h-72 lg:w-64 lg:h-80 object-cover rounded-sm" />
            <p class="mt-2 text-xs md:text-sm text-gray-500 text-center font-medium tracking-wide">
              {{ img.alt }}
            </p>
          </div>
        </div>
      }

      <!-- Reshuffle button -->
      <button
        (click)="reshuffle()"
        class="absolute bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest rounded-sm transition-all duration-300 hover:bg-gris-dark hover:text-white"
        style="background: rgba(26,26,26,0.06); color: #1a1a1a99; border: 1px solid rgba(26,26,26,0.1);">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        mezclar
      </button>
    </div>
  `,
  styles: [`
    .polaroid-card {
      left: 50%;
      top: 50%;
      margin-left: -96px;
      margin-top: -140px;
      opacity: 0;
      will-change: transform, opacity;
      cursor: grab;
    }
    @media (min-width: 768px) {
      .polaroid-card {
        margin-left: -144px;
        margin-top: -200px;
      }
    }
    @media (min-width: 1024px) {
      .polaroid-card {
        margin-left: -160px;
        margin-top: -220px;
      }
    }
  `],
})
export class PolaroidStackComponent {
  @Input() images: PolaroidImage[] = [];
  @ViewChild('container') container!: ElementRef;

  private platformId = inject(PLATFORM_ID);
  private gsap: any;
  private seed = 12345;

  private animated = false;

  constructor() {
    afterNextRender(async () => {
      if (!isPlatformBrowser(this.platformId)) return;
      const { gsap } = await import('gsap');
      this.gsap = gsap;
      this.setupObserver();
    });
  }

  private setupObserver() {
    const check = () => {
      const el = this.container?.nativeElement;
      if (!el) { requestAnimationFrame(check); return; }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !this.animated) {
            this.animated = true;
            this.animateIn();
            observer.disconnect();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(el);

      // Fallback: if section is already visible (e.g. fast scroll)
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        this.animated = true;
        this.animateIn();
        observer.disconnect();
      }
    };
    requestAnimationFrame(check);
  }

  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  private generatePositions() {
    const rand = this.seededRandom(this.seed);
    return this.images.map(() => ({
      x: (rand() - 0.5) * 80,
      y: (rand() - 0.5) * 60,
      rotation: (rand() - 0.5) * 30,
      scale: 0.95 + rand() * 0.1,
    }));
  }

  private animateIn() {
    if (!this.gsap) return;
    const cards = this.container.nativeElement.querySelectorAll('.polaroid-card');
    const positions = this.generatePositions();
    const rand = this.seededRandom(this.seed + 999);

    // Shuffle z-index order
    const zOrder = Array.from({ length: cards.length }, (_, i) => i);
    for (let i = zOrder.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [zOrder[i], zOrder[j]] = [zOrder[j], zOrder[i]];
    }

    this.gsap.set(cards, { opacity: 0, x: 0, y: 0, rotation: 0, scale: 1 });

    cards.forEach((card: HTMLElement, i: number) => {
      const pos = positions[i];
      card.style.zIndex = String(zOrder[i]);
      this.gsap.to(card, {
        opacity: 1,
        x: pos.x,
        y: pos.y,
        rotation: pos.rotation,
        scale: pos.scale,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'back.out(1.2)',
      });
    });
  }

  reshuffle() {
    this.seed = Math.floor(Math.random() * 1000000);
    this.animateIn();
  }
}
