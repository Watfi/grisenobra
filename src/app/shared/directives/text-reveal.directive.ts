import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  PLATFORM_ID,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTextReveal]',
  standalone: true,
})
export class TextRevealDirective {
  /** Delay in ms between each word animation */
  staggerDelay = input(80, { alias: 'appTextRevealDelay' });

  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const element = this.el.nativeElement as HTMLElement;
      const text = element.textContent?.trim() || '';
      if (!text) return;

      const words = text.split(/\s+/);
      element.textContent = '';
      element.style.opacity = '1';

      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
        span.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
        span.style.transitionDelay = `${i * this.staggerDelay()}ms`;
        span.classList.add('text-reveal-word');
        element.appendChild(span);
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const spans = element.querySelectorAll('.text-reveal-word');
              spans.forEach((s) => {
                (s as HTMLElement).style.opacity = '1';
                (s as HTMLElement).style.transform = 'translateY(0)';
              });
              observer.unobserve(element);
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(element);
    });
  }
}
