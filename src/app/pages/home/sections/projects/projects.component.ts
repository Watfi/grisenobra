import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../core/models/project.model';
import { ProjectsService } from '../../../../core/services/projects.service';

@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
})
export class ProjectsSectionComponent implements OnInit {
  private projectsService = inject(ProjectsService);

  projects = signal<Project[]>([]);
  selectedProject = signal<Project | null>(null);
  selectedImageIndex = signal(0);

  // Fallback projects for when Firebase is not configured
  private fallbackProjects: Project[] = [
    {
      id: '1',
      title: 'Casa Terracota',
      category: 'Interiorismo residencial',
      description: 'Un espacio que dialoga entre la calidez de la tierra y la sobriedad del concreto. Diseño de interiores que fusiona lo orgánico con lo contemporáneo.',
      coverImage: '/img/Casa_Terracota.jpg',
      images: ['/img/Casa_Terracota.jpg'],
      year: 2024,
      location: 'El Retiro, Antioquia',
      featured: true,
      slug: 'casa-terracota',
    },
    {
      id: '2',
      title: 'Loft Industrial Warm',
      category: 'Diseño de interiores',
      description: 'Transformación de un espacio industrial en un hogar con carácter. Materiales en bruto que cobran vida con la luz y la textura.',
      coverImage: '/img/Loft_Industrial_Warm.jpg',
      images: ['/img/Loft_Industrial_Warm.jpg'],
      year: 2024,
      location: 'Medellín, Antioquia',
      featured: true,
      slug: 'loft-industrial-warm',
    },
    {
      id: '3',
      title: 'Residencia Aura',
      category: 'Arquitectura & Interiorismo',
      description: 'Un proyecto que nace de la contemplación. Espacios diáfanos donde la naturaleza y la arquitectura se funden en una sola experiencia.',
      coverImage: '/img/Residencia_Aura.jpg',
      images: ['/img/Residencia_Aura.jpg'],
      year: 2023,
      location: 'Rionegro, Antioquia',
      featured: true,
      slug: 'residencia-aura',
    },
  ];

  async ngOnInit() {
    try {
      const featured = await this.projectsService.getFeatured();
      this.projects.set(featured.length ? featured : this.fallbackProjects);
    } catch {
      this.projects.set(this.fallbackProjects);
    }
  }

  openProject(project: Project) {
    this.selectedProject.set(project);
    this.selectedImageIndex.set(0);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.selectedProject.set(null);
    document.body.style.overflow = '';
  }

  nextImage() {
    const p = this.selectedProject();
    if (!p) return;
    this.selectedImageIndex.update(i => (i + 1) % p.images.length);
  }

  prevImage() {
    const p = this.selectedProject();
    if (!p) return;
    this.selectedImageIndex.update(i => (i - 1 + p.images.length) % p.images.length);
  }
}
