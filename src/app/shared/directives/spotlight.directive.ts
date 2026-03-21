import {
  Directive,
  ElementRef,
  afterNextRender,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appSpotlight]',
  standalone: true,
})
export class SpotlightDirective implements OnDestroy {
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private listener: ((e: MouseEvent) => void) | null = null;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const element = this.el.nativeElement as HTMLElement;
      element.style.position = 'relative';
      element.style.overflow = 'hidden';

      // Create spotlight overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute; inset: 0; pointer-events: none; z-index: 1;
        opacity: 0; transition: opacity 0.3s ease;
        background: radial-gradient(
          400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
          rgba(197, 160, 89, 0.08) 0%,
          transparent 70%
        );
      `;
      overlay.classList.add('spotlight-overlay');
      element.appendChild(overlay);

      this.listener = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        element.style.setProperty('--spotlight-x', `${x}px`);
        element.style.setProperty('--spotlight-y', `${y}px`);
        overlay.style.opacity = '1';
      };

      element.addEventListener('mousemove', this.listener);
      element.addEventListener('mouseleave', () => {
        overlay.style.opacity = '0';
      });
    });
  }

  ngOnDestroy() {
    if (this.listener) {
      this.el.nativeElement.removeEventListener('mousemove', this.listener);
    }
  }
}
