import { Component, signal, OnInit, inject } from '@angular/core';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeroComponent } from './sections/hero/hero.component';
import { ProjectsSectionComponent } from './sections/projects/projects.component';
import { PhilosophyComponent } from './sections/philosophy/philosophy.component';
import { ContactSectionComponent } from './sections/contact/contact.component';
import { VideoReelComponent } from './sections/video-reel/video-reel.component';
import { TestimonialsComponent } from './sections/testimonials/testimonials.component';
import { IntroSplashComponent } from '../../shared/components/intro-splash/intro-splash.component';
import { ContentService } from '../../core/services/content.service';
import { SiteContent, DEFAULT_SITE_CONTENT } from '../../core/models/site-content.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavComponent,
    FooterComponent,
    HeroComponent,
    ProjectsSectionComponent,
    PhilosophyComponent,
    ContactSectionComponent,
    VideoReelComponent,
    TestimonialsComponent,
    IntroSplashComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private contentService = inject(ContentService);
  content = signal<SiteContent>(DEFAULT_SITE_CONTENT);

  async ngOnInit() {
    try {
      const data = await this.contentService.get();
      this.content.set(data);
    } catch {
      // Keep default content
    }
  }
}
