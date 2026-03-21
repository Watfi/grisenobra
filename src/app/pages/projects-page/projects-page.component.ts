import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { ImageComparisonComponent } from '../../shared/components/image-comparison/image-comparison.component';
import { Project } from '../../core/models/project.model';
import { ProjectsService } from '../../core/services/projects.service';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [NavComponent, RouterLink, ImageComparisonComponent],
  templateUrl: './projects-page.component.html',
})
export class ProjectsPageComponent implements OnInit {
  private projectsService = inject(ProjectsService);

  projects = signal<Project[]>([]);
  selectedProject = signal<Project | null>(null);
  loading = signal(true);
  currentImageIndex = signal(0);
  currentSpaceIndex = signal(0);
  viewMode = signal<'gallery' | 'spaces'>('gallery');

  modalImages = computed(() => {
    const p = this.selectedProject();
    if (!p) return [];
    const all = [p.coverImage, ...(p.images ?? [])].filter(Boolean);
    return [...new Set(all)];
  });

  async ngOnInit() {
    try {
      const all = await this.projectsService.getAll();
      this.projects.set(all);
    } catch {
      this.projects.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openProject(project: Project) {
    this.selectedProject.set(project);
    this.currentImageIndex.set(0);
    this.currentSpaceIndex.set(0);
    this.viewMode.set(project.spaces?.length ? 'spaces' : 'gallery');
    document.body.style.overflow = 'hidden';
  }

  prevSpace(e: Event) {
    e.stopPropagation();
    const len = this.selectedProject()?.spaces?.length || 0;
    if (!len) return;
    this.currentSpaceIndex.set((this.currentSpaceIndex() - 1 + len) % len);
  }

  nextSpace(e: Event) {
    e.stopPropagation();
    const len = this.selectedProject()?.spaces?.length || 0;
    if (!len) return;
    this.currentSpaceIndex.set((this.currentSpaceIndex() + 1) % len);
  }

  closeModal() {
    this.selectedProject.set(null);
    document.body.style.overflow = '';
  }

  prevImage(e: Event) {
    e.stopPropagation();
    const len = this.modalImages().length;
    this.currentImageIndex.set((this.currentImageIndex() - 1 + len) % len);
  }

  nextImage(e: Event) {
    e.stopPropagation();
    const len = this.modalImages().length;
    this.currentImageIndex.set((this.currentImageIndex() + 1) % len);
  }
}
