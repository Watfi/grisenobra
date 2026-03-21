import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { ContactContent } from '../../../../core/models/site-content.model';
import { ContactService } from '../../../../core/services/contact.service';
import { emailjsConfig } from '../../../../core/services/emailjs.config';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
})
export class ContactSectionComponent {
  contact = input<ContactContent>();
  currentYear = new Date().getFullYear();

  private contactService = inject(ContactService);

  name = signal('');
  email = signal('');
  message = signal('');
  sending = signal(false);
  sent = signal(false);
  formError = signal('');

  async submit() {
    if (!this.name() || !this.email() || !this.message()) {
      this.formError.set('Por favor completa todos los campos.');
      return;
    }
    this.sending.set(true);
    this.formError.set('');
    try {
      await this.contactService.submit({
        name: this.name(),
        email: this.email(),
        message: this.message(),
      });

      // Notificar al admin por email (si el template está configurado)
      if (emailjsConfig.notificationTemplate !== 'EMAILJS_NOTIF_ID') {
        emailjs.send(
          emailjsConfig.serviceId,
          emailjsConfig.notificationTemplate,
          { name: this.name(), email: this.email(), message: this.message() },
          emailjsConfig.publicKey
        ).catch(() => {}); // no bloquear si falla el email
      }

      this.sent.set(true);
      this.name.set('');
      this.email.set('');
      this.message.set('');
    } catch {
      this.formError.set('Error enviando el mensaje. Intenta de nuevo.');
    } finally {
      this.sending.set(false);
    }
  }
}
