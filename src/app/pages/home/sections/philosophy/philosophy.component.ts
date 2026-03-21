import { Component, input, signal } from '@angular/core';
import { PhilosophyContent } from '../../../../core/models/site-content.model';
import { PolaroidStackComponent, PolaroidImage } from '../../../../shared/components/polaroid-stack/polaroid-stack.component';

@Component({
  selector: 'app-philosophy',
  standalone: true,
  imports: [PolaroidStackComponent],
  templateUrl: './philosophy.component.html',
})
export class PhilosophyComponent {
  philosophy = input<PhilosophyContent>();
  isHovered = signal(false);

  polaroidImages: PolaroidImage[] = [
    { src: '/img/Residencia_Aura.jpg', alt: 'Residencia Aura' },
    { src: '/img/Casa_Terracota.jpg', alt: 'Casa Terracota' },
    { src: '/img/Loft_Industrial_Warm.jpg', alt: 'Loft Industrial' },
    { src: '/img/cuarto.jpg', alt: 'Diseño Interior' },
    { src: '/img/hero_image.jpg', alt: 'Arquitectura' },
  ];
}
