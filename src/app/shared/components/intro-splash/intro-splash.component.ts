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
    .circle-wrap {
      width: 280px;
      height: 280px;
    }
    @media (min-width: 640px) {
      .circle-wrap {
        width: 350px;
        height: 350px;
      }
    }
    @media (min-width: 768px) {
      .circle-wrap {
        width: 420px;
        height: 420px;
      }
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
          class="circle-wrap relative flex items-center justify-center rounded-full"
          style="border: none; background: transparent;"
        >
          <!-- SVG stroke that draws the circle border -->
          <svg #strokeSvg class="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none"
            style="transform: rotate(-90deg);">
            <circle
              #strokeCircle
              cx="100" cy="100" r="97"
              stroke="#6b6b5f"
              stroke-width="2"
              fill="none"
              stroke-dasharray="609.47"
              stroke-dashoffset="609.47"
              stroke-linecap="round"
            />
          </svg>
          <!-- Background fill (fades in after stroke draws) -->
          <div #circleFill class="absolute inset-[2px] rounded-full opacity-0" style="background: #8a8a7a;"></div>

          <!-- Logo -->
          <div class="relative z-10 flex items-center gap-3 md:gap-5 font-sans font-light lowercase tracking-[0.15em] select-none" style="color: #d5d4cf;">
            <span #wordGris class="text-5xl sm:text-6xl md:text-7xl opacity-0">gris</span>

            <span class="inline-flex flex-col items-center justify-center tracking-normal text-2xl sm:text-3xl md:text-4xl" style="line-height: 0;">
              <span #letterE class="opacity-0" style="padding-bottom: 0.2em; line-height: 1;">e</span>
              <span #dividerLine class="w-full h-[1.5px] block scale-x-0 opacity-0 splash-divider"></span>
              <span #letterN class="opacity-0" style="padding-top: 0.2em; line-height: 1;">n</span>
            </span>

            <span #wordObra class="text-5xl sm:text-6xl md:text-7xl opacity-0">obra</span>
          </div>
        </div>

        <!-- Vaporize canvas overlay -->
        <canvas #vaporizeCanvas class="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-0"></canvas>
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
  @ViewChild('vaporizeCanvas') vaporizeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('strokeCircle') strokeCircle!: ElementRef;
  @ViewChild('strokeSvg') strokeSvg!: ElementRef;
  @ViewChild('circleFill') circleFill!: ElementRef;

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
    gsap.set(this.vaporizeCanvas.nativeElement, gpuHint);

    const tl = gsap.timeline();

    // 0. Background shapes drift in softly
    tl.to(this.bgShape1.nativeElement, {
      opacity: 1, x: 30, y: 20, duration: 1, ease: 'power2.out',
    }, 0);
    tl.to(this.bgShape2.nativeElement, {
      opacity: 1, x: -20, y: -15, duration: 1, ease: 'power2.out',
    }, 0.1);

    // 1a. Draw circle stroke like a pen tracing it (1.5 turns for spiral feel)
    tl.to(this.strokeCircle.nativeElement, {
      attr: { 'stroke-dashoffset': 0 },
      duration: 1.4,
      ease: 'power2.inOut',
    }, 0.15);
    // Rotate SVG while drawing to create spiral visual
    tl.to(this.strokeSvg.nativeElement, {
      rotation: 270,
      duration: 1.4,
      ease: 'power2.inOut',
    }, 0.15);
    // 1b. Fill the circle after stroke completes
    tl.to(this.circleFill.nativeElement, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
    }, 1.3);

    // 2. "gris" slides from left
    tl.fromTo(this.wordGris.nativeElement,
      { x: -25, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      1.5
    );

    // 3. "obra" slides from right
    tl.fromTo(this.wordObra.nativeElement,
      { x: 25, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      1.6
    );

    // 4. Divider line draws from center
    tl.to(this.dividerLine.nativeElement,
      { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 1.9
    );

    // 5. "e" drops + "n" rises
    tl.fromTo(this.letterE.nativeElement,
      { y: -14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 2.1
    );
    tl.fromTo(this.letterN.nativeElement,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 2.2
    );

    // 6. Color shift: gray → gold → white
    const textEls = [
      this.wordGris.nativeElement,
      this.wordObra.nativeElement,
      this.letterE.nativeElement,
      this.letterN.nativeElement,
    ];
    tl.to(textEls, { color: '#c5a059', duration: 0.5, ease: 'power1.inOut' }, 2.5);
    tl.to(textEls, { color: '#d5d4cf', duration: 0.4, ease: 'power1.inOut' }, 3.0);
    tl.to(this.dividerLine.nativeElement, { backgroundColor: '#c5a059', duration: 0.5 }, 2.5);
    tl.to(this.dividerLine.nativeElement, { backgroundColor: '#d5d4cf', duration: 0.4 }, 3.0);

    // 7. Vaporize effect: capture circle content into canvas particles, then disintegrate
    tl.add(() => this.startVaporize(gsap, tl), 3.2);
  }

  private startVaporize(gsap: any, tl: any) {
    const canvas = this.vaporizeCanvas.nativeElement;
    const container = this.splashContainer.nativeElement;
    const circle = this.circleContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const circleRect = circle.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d')!;

    // Capture the circle area pixels using html2canvas-like approach:
    // Instead, we'll create particles from the circle's bounding box
    const cx = circleRect.left - rect.left + circleRect.width / 2;
    const cy = circleRect.top - rect.top + circleRect.height / 2;
    const radius = circleRect.width / 2;

    // Create particles in the circle area
    type VParticle = {
      x: number; y: number; vx: number; vy: number;
      opacity: number; size: number; color: string;
      angle: number; speed: number; turbulence: number;
    };
    const particles: VParticle[] = [];
    const step = 3;
    for (let y = cy - radius; y < cy + radius; y += step) {
      for (let x = cx - radius; x < cx + radius; x += step) {
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy <= radius * radius) {
          // Distance from center determines color (inner = lighter)
          const dist = Math.sqrt(dx * dx + dy * dy) / radius;
          const isText = dist < 0.7 && Math.random() > 0.6;
          const color = isText
            ? `rgba(213,212,207,${0.6 + Math.random() * 0.4})`
            : `rgba(138,138,122,${0.4 + Math.random() * 0.5})`;

          particles.push({
            x, y, vx: 0, vy: 0,
            opacity: 1,
            size: 1.5 + Math.random() * 1.5,
            color,
            angle: Math.random() * Math.PI * 2,
            speed: 1 + Math.random() * 3,
            turbulence: Math.random() * 0.3,
          });
        }
      }
    }

    // Show canvas, hide original circle
    gsap.set(canvas, { opacity: 1 });
    gsap.set(circle, { opacity: 0 });

    // Animate particles
    let progress = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      progress = Math.min(1, elapsed / duration);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        // Activate particle based on position (left-to-right wave)
        const activateAt = ((p.x - (cx - radius)) / (radius * 2)) * 0.6;
        if (progress < activateAt) {
          // Still static
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          alive = true;
          continue;
        }

        const localProgress = (progress - activateAt) / (1 - activateAt);

        if (p.vx === 0 && p.vy === 0) {
          p.vx = Math.cos(p.angle) * p.speed;
          p.vy = Math.sin(p.angle) * p.speed - 1.5; // bias upward
        }

        p.vx += (Math.random() - 0.5) * p.turbulence;
        p.vy -= 0.05; // float up
        p.x += p.vx;
        p.y += p.vy;
        p.opacity = Math.max(0, 1 - localProgress * 1.5);

        if (p.opacity > 0.01) {
          alive = true;
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size * (1 - localProgress * 0.5), p.size * (1 - localProgress * 0.5));

          // Subtle glow
          if (p.opacity > 0.3) {
            ctx.globalAlpha = p.opacity * 0.15;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;

      if (alive && progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Done — fade out splash
        gsap.to(this.splashContainer.nativeElement, {
          opacity: 0, duration: 0.3, ease: 'power2.in',
          onComplete: () => {
            try { sessionStorage.setItem('grisenobra-intro-played', '1'); } catch {}
            this.visible.set(false);
            this.animationDone.emit();
          },
        });
      }
    };

    requestAnimationFrame(animate);
  }
}
