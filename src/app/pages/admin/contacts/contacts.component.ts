import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { ContactService } from '../../../core/services/contact.service';
import { ContactSubmission } from '../../../core/models/contact-submission.model';
import { emailjsConfig } from '../../../core/services/emailjs.config';

type FilterStatus = 'todos' | 'abierto' | 'cerrado';

interface FilterTab { key: FilterStatus; label: string; }

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
})
export class ContactsComponent implements OnInit {
  private contactService = inject(ContactService);

  readonly filterTabs: FilterTab[] = [
    { key: 'todos',   label: 'Todas' },
    { key: 'abierto', label: 'Abiertas' },
    { key: 'cerrado', label: 'Cerradas' },
  ];

  submissions = signal<ContactSubmission[]>([]);
  selected = signal<ContactSubmission | null>(null);
  filter = signal<FilterStatus>('todos');
  replyText = signal('');
  loading = signal(false);
  sending = signal(false);
  error = signal('');
  success = signal('');

  filtered = computed(() => {
    const f = this.filter();
    const all = this.submissions();
    if (f === 'todos') return all;
    return all.filter(s => s.status === f);
  });

  counts = computed(() => ({
    todos: this.submissions().length,
    abierto: this.submissions().filter(s => s.status === 'abierto').length,
    cerrado: this.submissions().filter(s => s.status === 'cerrado').length,
  }));

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      this.submissions.set(await this.contactService.getAll());
    } catch {
      this.error.set('Error cargando consultas.');
    } finally {
      this.loading.set(false);
    }
  }

  open(sub: ContactSubmission) {
    this.selected.set(sub);
    this.replyText.set('');
    this.success.set('');
    this.error.set('');
  }

  close() {
    this.selected.set(null);
    this.replyText.set('');
  }

  async sendReply() {
    const sub = this.selected();
    if (!sub || !this.replyText().trim()) return;

    const emailjsReady =
      emailjsConfig.serviceId !== 'EMAILJS_SERVICE_ID' &&
      emailjsConfig.templateId !== 'EMAILJS_TEMPLATE_ID' &&
      emailjsConfig.publicKey !== 'EMAILJS_PUBLIC_KEY';

    this.sending.set(true);
    this.error.set('');
    try {
      // Send email via EmailJS (only if configured)
      if (emailjsReady) {
        await emailjs.send(
          emailjsConfig.serviceId,
          emailjsConfig.templateId,
          {
            name:     sub.name,      // {{name}}  → nombre del cliente
            email:    sub.email,     // {{email}} → destinatario (To field)
            title:    this.replyText(), // {{title}} → cuerpo de la respuesta
          },
          emailjsConfig.publicKey
        );
      }

      // Save reply + mark cerrado in Firestore
      await this.contactService.markReplied(sub.id!, this.replyText());
      await this.load();

      // Update selected in place
      const updated = this.submissions().find(s => s.id === sub.id);
      this.selected.set(updated ?? null);
      this.success.set(emailjsReady
        ? 'Respuesta enviada y consulta cerrada.'
        : 'Consulta marcada como cerrada (EmailJS no configurado — el correo no se envió).'
      );
      this.replyText.set('');
    } catch {
      this.error.set('Error enviando la respuesta.');
    } finally {
      this.sending.set(false);
    }
  }

  async reopen() {
    const sub = this.selected();
    if (!sub) return;
    try {
      await this.contactService.reopen(sub.id!);
      await this.load();
      const updated = this.submissions().find(s => s.id === sub.id);
      this.selected.set(updated ?? null);
      this.success.set('');
    } catch {
      this.error.set('Error reabriendo consulta.');
    }
  }

  formatDate(d: Date): string {
    return new Date(d).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
