import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';
import { StorageService } from '../../../core/services/storage.service';
import { SiteContent, DEFAULT_SITE_CONTENT } from '../../../core/models/site-content.model';

@Component({
  selector: 'app-content-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './content-editor.component.html',
})
export class ContentEditorComponent implements OnInit {
  private contentService = inject(ContentService);
  private storageService = inject(StorageService);

  content = signal<SiteContent>({ ...DEFAULT_SITE_CONTENT });
  loading = signal(false);
  uploading = signal(false);
  success = signal('');
  error = signal('');

  async ngOnInit() {
    this.loading.set(true);
    try {
      this.content.set(await this.contentService.get());
    } catch {
      this.error.set('Error cargando el contenido.');
    } finally {
      this.loading.set(false);
    }
  }

  updateHero(field: string, value: string) {
    this.content.update(c => ({ ...c, hero: { ...c.hero, [field]: value } }));
  }

  updatePhilosophy(field: string, value: string) {
    this.content.update(c => ({ ...c, philosophy: { ...c.philosophy, [field]: value } }));
  }

  updateContact(field: string, value: string) {
    this.content.update(c => ({ ...c, contact: { ...c.contact, [field]: value } }));
  }

  async uploadImage(event: Event, section: 'hero' | 'philosophy') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    try {
      const url = await this.storageService.upload(file, 'content');
      if (section === 'hero') this.updateHero('bgImage', url);
      else this.updatePhilosophy('image', url);
    } catch {
      this.error.set('Error subiendo la imagen.');
    } finally {
      this.uploading.set(false);
    }
  }

  async save() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await this.contentService.save(this.content());
      this.success.set('Contenido guardado exitosamente.');
    } catch {
      this.error.set('Error guardando el contenido. Verifica la configuración de Firebase.');
    } finally {
      this.loading.set(false);
    }
  }
}
