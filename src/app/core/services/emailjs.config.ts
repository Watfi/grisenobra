/**
 * Configuración de EmailJS para enviar respuestas de contacto.
 *
 * Pasos para configurar:
 * 1. Crear cuenta gratuita en https://www.emailjs.com
 * 2. Agregar un "Email Service" (Gmail, Outlook, etc.)
 * 3. El template debe tener estas variables (las que usa EmailJS):
 *      {{name}}   → nombre del cliente
 *      {{email}}  → email destinatario (campo "To Email" del template)
 *      {{title}}  → texto de la respuesta del admin
 * 4. Copiar los IDs y pegarlos aquí.
 */
export const emailjsConfig = {
  serviceId:            'service_cl09vul',   // ← Account > Email Services > Service ID
  templateId:           'template_78n8qoj',  // ← Reply template (envía respuesta al cliente)
  notificationTemplate: 'template_p9iy8sa',  // ← Notification template (avisa al admin de nueva consulta)
  publicKey:            'BYdvJAigp7fQWZ5-X', // ← Account > General > Public Key
};
