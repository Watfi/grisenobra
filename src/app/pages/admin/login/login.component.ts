import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styles: [`
    /* ── Conic gradient cones (matches original h-56 = 14rem) ── */
    .lamp-cone-l {
      position: absolute;
      inset: auto;
      right: 50%;
      height: 14rem;
      overflow: visible;
      background: conic-gradient(from 70deg at center top, #c5a059, transparent 40%, transparent);
    }
    .lamp-cone-r {
      position: absolute;
      inset: auto;
      left: 50%;
      height: 14rem;
      overflow: visible;
      background: conic-gradient(from 290deg at center top, transparent, transparent 60%, #c5a059);
    }

    /* ── Focused glow (h-36 = 9rem, -translate-y-[6rem]) ── */
    .lamp-glow-sm {
      position: absolute;
      inset: auto;
      z-index: 30;
      height: 9rem;
      border-radius: 9999px;
      background: #d4b06a;
      filter: blur(32px);
      transform: translateY(-6rem);
    }

    /* ── Light bar (h-0.5 = 2px, -translate-y-[7rem]) ── */
    .lamp-bar {
      position: absolute;
      inset: auto;
      z-index: 50;
      height: 2px;
      background: #d4b06a;
      transform: translateY(-7rem);
    }

    /* ── Animations ── */
    .lamp-anim-expand {
      animation: lamp-expand 1.2s 0.3s ease-in-out both;
    }
    .lamp-anim-glow-sm {
      animation: lamp-glow-sm 1.2s 0.3s ease-in-out both;
    }
    @keyframes lamp-expand {
      from { width: 15rem; opacity: 0.5; }
      to   { width: 30rem; opacity: 1; }
    }
    @keyframes lamp-glow-sm {
      from { width: 8rem; }
      to   { width: 16rem; }
    }
    .login-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1rem;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .login-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: white;
      outline: none;
      transition: border-color 0.3s ease, background 0.3s ease;
    }
    .login-input::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
    .login-input:focus {
      border-color: rgba(197, 160, 89, 0.4);
      background: rgba(255, 255, 255, 0.06);
    }
    .login-btn {
      width: 100%;
      position: relative;
      overflow: hidden;
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      color: white;
      text-transform: lowercase;
      letter-spacing: 0.15em;
      cursor: pointer;
      background: linear-gradient(135deg, rgba(197,160,89,0.2) 0%, rgba(197,160,89,0.1) 100%);
      border: 1px solid rgba(197, 160, 89, 0.2);
      transition: all 0.3s ease;
    }
    .login-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(197,160,89,0.35) 0%, rgba(197,160,89,0.2) 100%);
      border-color: rgba(197, 160, 89, 0.4);
    }
    .login-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .login-fade-in {
      animation: login-fade-up 0.8s ease-out both;
    }
    @keyframes login-fade-up {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentYear = new Date().getFullYear();
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);
  mode = signal<'login' | 'reset'>('login');
  resetSent = signal(false);

  async onSubmit() {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/admin']);
    } catch {
      this.error.set('Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      this.loading.set(false);
    }
  }

  async onReset() {
    if (!this.email) {
      this.error.set('Ingresa tu email para recuperar la contraseña.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    try {
      await this.authService.resetPassword(this.email);
      this.resetSent.set(true);
    } catch {
      this.error.set('No se pudo enviar el correo. Verifica el email ingresado.');
    } finally {
      this.loading.set(false);
    }
  }

  switchMode(m: 'login' | 'reset') {
    this.mode.set(m);
    this.error.set('');
    this.resetSent.set(false);
  }
}
