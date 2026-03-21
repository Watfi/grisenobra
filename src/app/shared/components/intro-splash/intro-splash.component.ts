import {
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
  output,
  signal,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-intro-splash',
  standalone: true,
  styles: [`
    .splash-divider {
      background: #d5d4cf;
    }
  `],
  template: `
    @if (visible()) {
      <div
        #splashContainer
        class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style="background: #1a1a1a;"
      >
        <!-- Subtle animated background shapes -->
        <div #bgShape1 class="absolute w-[500px] h-[500px] rounded-full opacity-0"
          style="background: radial-gradient(circle, rgba(197,160,89,0.06) 0%, transparent 70%); top: 10%; left: -10%;"></div>
        <div #bgShape2 class="absolute w-[400px] h-[400px] rounded-full opacity-0"
          style="background: radial-gradient(circle, rgba(245,245,240,0.04) 0%, transparent 70%); bottom: 5%; right: -5%;"></div>

        <!-- Circle container for logo -->
        <div
          #circleContainer
          class="relative flex items-center justify-center rounded-full scale-0"
          style="width: 420px; height: 420px; border: none; background: #8a8a7a;"
        >
          <!-- Logo -->
          <div class="flex items-center gap-3 md:gap-5 font-sans font-light lowercase tracking-[0.15em] select-none" style="color: #d5d4cf;">
            <span #wordGris class="text-5xl sm:text-6xl md:text-7xl opacity-0">gris</span>

            <span class="inline-flex flex-col items-center justify-center tracking-normal text-2xl sm:text-3xl md:text-4xl" style="line-height: 0;">
              <span #letterE class="opacity-0" style="padding-bottom: 0.2em; line-height: 1;">e</span>
              <span #dividerLine class="w-full h-[1.5px] block scale-x-0 opacity-0 splash-divider"></span>
              <span #letterN class="opacity-0" style="padding-top: 0.2em; line-height: 1;">n</span>
            </span>

            <span #wordObra class="text-5xl sm:text-6xl md:text-7xl opacity-0">obra</span>
          </div>
        </div>

        <!-- Golden shine sweep -->
        <div
          #shineOverlay
          class="absolute inset-0 pointer-events-none opacity-0"
          style="background: linear-gradient(90deg, transparent 0%, rgba(197,160,89,0.2) 45%, rgba(197,160,89,0.4) 50%, rgba(197,160,89,0.2) 55%, transparent 100%); transform: translateX(-100%);"
        ></div>
      </div>
    }
  `,
})
export class IntroSplashComponent {
  @ViewChild('splashContainer') splashContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('circleContainer') circleContainer!: ElementRef;
  @ViewChild('bgShape1') bgShape1!: ElementRef;
  @ViewChild('bgShape2') bgShape2!: ElementRef;
  @ViewChild('wordGris') wordGris!: ElementRef;
  @ViewChild('wordObra') wordObra!: ElementRef;
  @ViewChild('letterE') letterE!: ElementRef;
  @ViewChild('letterN') letterN!: ElementRef;
  @ViewChild('dividerLine') dividerLine!: ElementRef;
  @ViewChild('shineOverlay') shineOverlay!: ElementRef;
  @ViewChild('circleBorder') circleBorder!: ElementRef;

  animationDone = output<void>();
  visible = signal(true);

  private platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(async () => {
      if (!isPlatformBrowser(this.platformId)) return;

      // Skip if already played this session
      try {
        if (sessionStorage.getItem('grisenobra-intro-played')) {
          this.visible.set(false);
          this.animationDone.emit();
          return;
        }
      } catch {
        // sessionStorage unavailable — continue with animation
      }

      const { gsap } = await import('gsap');
      // Wait for ViewChild refs to be ready
      const waitForRefs = () => {
        if (this.circleContainer?.nativeElement) {
          this.runAnimation(gsap);
        } else {
          requestAnimationFrame(waitForRefs);
        }
      };
      requestAnimationFrame(waitForRefs);
    });
  }

  private runAnimation(gsap: any) {
    // Force GPU compositing on animated elements
    const gpuHint = { willChange: 'transform, opacity' };
    gsap.set(this.circleContainer.nativeElement, gpuHint);
    gsap.set(this.splashContainer.nativeElement, gpuHint);
    gsap.set(this.shineOverlay.nativeElement, gpuHint);

    const tl = gsap.timeline({
      onComplete: () => {
        try { sessionStorage.setItem('grisenobra-intro-played', '1'); } catch {}
        this.visible.set(false);
        this.animationDone.emit();
      },
    });

    // 0. Background shapes drift in softly
    tl.to(this.bgShape1.nativeElement, {
      opacity: 1, x: 30, y: 20, duration: 1, ease: 'power2.out',
    }, 0);
    tl.to(this.bgShape2.nativeElement, {
      opacity: 1, x: -20, y: -15, duration: 1, ease: 'power2.out',
    }, 0.1);

    // 1. Circle scales in with smooth bounce
    tl.to(this.circleContainer.nativeElement, {
      scale: 1, duration: 0.8, ease: 'back.out(1.2)',
    }, 0.15);

    // 2. "gris" slides from left
    tl.fromTo(this.wordGris.nativeElement,
      { x: -25, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      0.55
    );

    // 3. "obra" slides from right (slight stagger)
    tl.fromTo(this.wordObra.nativeElement,
      { x: 25, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      0.65
    );

    // 4. Divider line draws from center
    tl.to(this.dividerLine.nativeElement,
      { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 0.9
    );

    // 5. "e" drops + "n" rises
    tl.fromTo(this.letterE.nativeElement,
      { y: -14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 1.1
    );
    tl.fromTo(this.letterN.nativeElement,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 1.2
    );

    // 6. Color shift: gray → gold → white (smooth transition)
    const textEls = [
      this.wordGris.nativeElement,
      this.wordObra.nativeElement,
      this.letterE.nativeElement,
      this.letterN.nativeElement,
    ];
    tl.to(textEls, { color: '#c5a059', duration: 0.5, ease: 'power1.inOut' }, 1.5);
    tl.to(textEls, { color: '#f5f5f0', duration: 0.4, ease: 'power1.inOut' }, 2.0);
    tl.to(this.dividerLine.nativeElement, { backgroundColor: '#c5a059', duration: 0.5 }, 1.5);
    tl.to(this.dividerLine.nativeElement, { backgroundColor: '#f5f5f0', duration: 0.4 }, 2.0);

    // 7. Golden shine sweep
    tl.to(this.shineOverlay.nativeElement, { opacity: 1, duration: 0.1 }, 2.2);
    tl.to(this.shineOverlay.nativeElement, { x: '200%', duration: 0.6, ease: 'power2.inOut' }, 2.2);
    tl.to(this.shineOverlay.nativeElement, { opacity: 0, duration: 0.15 }, 2.7);

    // 8. Fade out splash
    tl.to(this.splashContainer.nativeElement, {
      opacity: 0, scale: 1.05, duration: 0.5, ease: 'power2.in',
    }, 2.9);
  }
}
