import { Component, input } from '@angular/core';
import { HeroContent } from '../../../../core/models/site-content.model';
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  hero = input<HeroContent>();
}
