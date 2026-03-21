import {
  Component,
  signal,
  computed,
  afterNextRender,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Testimonial } from '../../../../core/models/testimonial.model';

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote: 'Transformaron nuestra casa en un espacio que respira calidez y sofisticacion. Cada detalle fue cuidadosamente pensado.',
    clientName: 'Carolina Mejia',
    projectName: 'Casa Terracota',
  },
  {
    id: '2',
    quote: 'El equipo de Gris en Obra entendio nuestra vision desde el primer dia. El resultado supero todas nuestras expectativas.',
    clientName: 'Andres Restrepo',
    projectName: 'Loft Industrial Warm',
  },
  {
    id: '3',
    quote: 'Profesionalismo, creatividad y una sensibilidad unica para los espacios. No podriamos estar mas contentos con el resultado.',
    clientName: 'Valentina Ochoa',
    projectName: 'Residencia Aura',
  },
  {
    id: '4',
    quote: 'Nos guiaron en cada paso del proceso con una paciencia increible. Nuestro apartamento ahora se siente como un hogar de revista.',
    clientName: 'Felipe Gonzalez',
    projectName: 'Apartamento Cielo',
  },
  {
    id: '5',
    quote: 'La atencion al detalle y el uso de materiales naturales le dieron a nuestro espacio una identidad unica e irrepetible.',
    clientName: 'Mariana Duque',
    projectName: 'Villa Serena',
  },
];

@Component({
  selector: 'app-testimonials',
  standalone: true,
  templateUrl: './testimonials.component.html',
})
export class TestimonialsComponent implements OnDestroy {
  testimonials = TESTIMONIALS;
  activeIndex = signal(0);
  private intervalId: any;
  private platformId = inject(PLATFORM_ID);

  totalCards = computed(() => this.testimonials.length);

  getTransform(i: number): string {
    const total = this.totalCards();
    const active = this.activeIndex();
    const angle = ((i - active) / total) * 360;
    const radius = 320;
    return `rotateY(${angle}deg) translateZ(${radius}px)`;
  }

  getOpacity(i: number): number {
    const total = this.totalCards();
    const active = this.activeIndex();
    const diff = Math.abs(i - active);
    const wrappedDiff = Math.min(diff, total - diff);
    if (wrappedDiff === 0) return 1;
    if (wrappedDiff === 1) return 0.6;
    return 0.3;
  }

  getScale(i: number): number {
    const total = this.totalCards();
    const active = this.activeIndex();
    const diff = Math.abs(i - active);
    const wrappedDiff = Math.min(diff, total - diff);
    return wrappedDiff === 0 ? 1.1 : 0.85;
  }

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.intervalId = setInterval(() => this.next(), 5000);
    });
  }

  next() {
    this.activeIndex.set((this.activeIndex() + 1) % this.totalCards());
  }

  prev() {
    this.activeIndex.set((this.activeIndex() - 1 + this.totalCards()) % this.totalCards());
  }

  goTo(i: number) {
    this.activeIndex.set(i);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
