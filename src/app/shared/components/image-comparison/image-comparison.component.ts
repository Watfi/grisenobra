import { Component, Input, signal, HostListener, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-image-comparison',
  standalone: true,
  template: `
    <div class="relative overflow-hidden select-none cursor-ew-resize w-full h-full"
         (mousedown)="onDragStart()"
         (mouseup)="onDragEnd()"
         (mouseleave)="onDragEnd()"
         (mousemove)="onMove($event)"
         (touchstart)="onDragStart()"
         (touchend)="onDragEnd()"
         (touchmove)="onTouchMove($event)">

      <!-- After image (full, underneath) -->
      <img [src]="afterImage" [alt]="'Después - ' + spaceName"
           class="absolute inset-0 w-full h-full object-cover" />

      <!-- Before image (clipped) -->
      <img [src]="beforeImage" [alt]="'Antes - ' + spaceName"
           class="absolute inset-0 w-full h-full object-cover"
           [style.clip-path]="'inset(0 ' + (100 - position()) + '% 0 0)'" />

      <!-- Slider line -->
      <div class="absolute top-0 bottom-0 w-0.5 z-10"
           [style.left]="position() + '%'"
           style="background: rgba(255,255,255,0.5); backdrop-filter: blur(2px);">
        <!-- Handle -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l-3 3 3 3m8-6l3 3-3 3"/>
          </svg>
        </div>
      </div>

      <!-- Labels -->
      <div class="absolute top-4 left-4 z-10 px-3 py-1 text-[10px] uppercase tracking-widest text-white rounded-sm"
           style="background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);">
        antes
      </div>
      <div class="absolute top-4 right-4 z-10 px-3 py-1 text-[10px] uppercase tracking-widest text-white rounded-sm"
           style="background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);">
        después
      </div>
    </div>
  `,
})
export class ImageComparisonComponent {
  @Input() beforeImage = '';
  @Input() afterImage = '';
  @Input() spaceName = '';

  private el = inject(ElementRef);
  position = signal(50);
  private dragging = false;

  onDragStart() { this.dragging = true; }
  onDragEnd() { this.dragging = false; }

  onMove(e: MouseEvent) {
    if (!this.dragging) return;
    this.updatePosition(e.clientX);
  }

  onTouchMove(e: TouchEvent) {
    if (!this.dragging) return;
    this.updatePosition(e.touches[0].clientX);
  }

  private updatePosition(clientX: number) {
    const rect = this.el.nativeElement.querySelector('div').getBoundingClientRect();
    const pct = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100);
    this.position.set(pct);
  }
}
