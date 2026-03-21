import { Component, signal, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  private router = inject(Router);
  menuOpen = signal(false);

  toggleMenu() { this.menuOpen.update(v => !v); }

  @HostListener('document:keydown.escape')
  closeMenu() { this.menuOpen.set(false); }

  goTo(fragment?: string) {
    this.closeMenu();
    const onHome = this.router.url.split('?')[0].split('#')[0] === '/';

    if (onHome) {
      this.scrollToFragment(fragment);
    } else {
      this.router.navigate(['/']).then(() => {
        // delay generoso para que Angular renderice y estabilice el layout
        setTimeout(() => this.scrollToFragment(fragment), 400);
      });
    }
  }

  private scrollToFragment(fragment?: string) {
    if (!fragment) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(fragment);
    if (!el) return;
    // offsetTop acumulado (por si el elemento está dentro de varios padres)
    let top = 0;
    let node: HTMLElement | null = el;
    while (node) {
      top += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    // restar altura del nav fijo (~80px)
    window.scrollTo({ top: Math.max(0, top - 80), behavior: 'smooth' });
  }
}
