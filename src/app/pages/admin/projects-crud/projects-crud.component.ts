import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, ProjectSpace } from '../../../core/models/project.model';
import { ProjectsService } from '../../../core/services/projects.service';
import { StorageService } from '../../../core/services/storage.service';

type FormMode = 'list' | 'create' | 'edit';

const emptyProject = (): Omit<Project, 'id'> => ({
  title: '',
  category: '',
  description: '',
  coverImage: '',
  images: [],
  spaces: [],
  year: new Date().getFullYear(),
  location: '',
  featured: false,
  slug: '',
});

@Component({
  selector: 'app-projects-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-crud.component.html',
})
export class ProjectsCrudComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private storageService = inject(StorageService);

  projects = signal<Project[]>([]);
  mode = signal<FormMode>('list');
  form = signal<Omit<Project, 'id'>>(emptyProject());
  editingId = signal<string | null>(null);
  loading = signal(false);
  uploading = signal(false);
  error = signal('');
  success = signal('');

  async ngOnInit() {
    await this.loadProjects();
  }

  async loadProjects() {
    this.loading.set(true);
    try {
      this.projects.set(await this.projectsService.getAll());
    } catch (e: unknown) {
      this.error.set('Error cargando proyectos. Verifica la configuración de Firebase.');
    } finally {
      this.loading.set(false);
    }
  }

  startCreate() {
    this.form.set(emptyProject());
    this.editingId.set(null);
    this.mode.set('create');
    this.error.set('');
    this.success.set('');
  }

  startEdit(project: Project) {
    this.form.set({ ...project, spaces: project.spaces || [] });
    this.editingId.set(project.id!);
    this.mode.set('edit');
    this.error.set('');
    this.success.set('');
  }

  cancel() {
    this.mode.set('list');
    this.error.set('');
    this.success.set('');
  }

  updateForm(field: keyof Omit<Project, 'id'>, value: unknown) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  generateSlug(title: string): string {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  onTitleChange(title: string) {
    this.form.update(f => ({ ...f, title, slug: this.generateSlug(title) }));
  }

  async onCoverUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    try {
      const url = await this.storageService.upload(file, 'projects');
      this.form.update(f => ({ ...f, coverImage: url }));
    } catch {
      this.error.set('Error subiendo imagen.');
    } finally {
      this.uploading.set(false);
    }
  }

  async onImagesUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files?.length) return;
    this.uploading.set(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map(f => this.storageService.upload(f, 'projects'))
      );
      this.form.update(f => ({ ...f, images: [...f.images, ...urls] }));
    } catch {
      this.error.set('Error subiendo imágenes.');
    } finally {
      this.uploading.set(false);
    }
  }

  removeImage(index: number) {
    this.form.update(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
    }));
  }

  addSpace() {
    this.form.update(f => ({
      ...f,
      spaces: [...(f.spaces ?? []), { name: '', beforeImage: '', afterImage: '' }],
    }));
  }

  removeSpace(index: number) {
    this.form.update(f => ({
      ...f,
      spaces: (f.spaces ?? []).filter((_, i) => i !== index),
    }));
  }

  updateSpaceName(index: number, name: string) {
    this.form.update(f => {
      const spaces = [...(f.spaces ?? [])];
      spaces[index] = { ...spaces[index], name };
      return { ...f, spaces };
    });
  }

  async onSpaceImageUpload(event: Event, index: number, type: 'beforeImage' | 'afterImage') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    try {
      const url = await this.storageService.upload(file, 'projects/spaces');
      this.form.update(f => {
        const spaces = [...(f.spaces ?? [])];
        spaces[index] = { ...spaces[index], [type]: url };
        return { ...f, spaces };
      });
    } catch {
      this.error.set('Error subiendo imagen.');
    } finally {
      this.uploading.set(false);
    }
  }

  async save() {
    this.loading.set(true);
    this.error.set('');
    try {
      const data = this.form();
      if (!data.coverImage && data.images.length > 0) {
        data.coverImage = data.images[0];
        data.images = data.images.slice(1);
      }
      if (this.mode() === 'edit' && this.editingId()) {
        await this.projectsService.update(this.editingId()!, data);
      } else {
        await this.projectsService.create(data);
      }
      this.success.set('Proyecto guardado exitosamente.');
      await this.loadProjects();
      this.mode.set('list');
    } catch {
      this.error.set('Error guardando el proyecto.');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteProject(project: Project) {
    if (!confirm(`¿Eliminar "${project.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await this.projectsService.delete(project.id!);
      await this.loadProjects();
    } catch {
      this.error.set('Error eliminando el proyecto.');
    }
  }
}
