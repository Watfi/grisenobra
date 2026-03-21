import {
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution;

    // Two-octave noise (optimized)
    float n1 = snoise(uv * 2.0 + u_time * 0.08);
    float n2 = snoise(uv * 4.0 - u_time * 0.05) * 0.5;
    float noise = n1 + n2;

    // Mouse influence (subtle warm glow near cursor)
    float mouseDist = distance(uv, mouse);
    float mouseGlow = smoothstep(0.4, 0.0, mouseDist) * 0.15;

    // Brand colors
    vec3 dark = vec3(0.102, 0.102, 0.102);    // #1A1A1A
    vec3 accent = vec3(0.773, 0.627, 0.349);  // #C5A059
    vec3 warm = vec3(0.961, 0.961, 0.941);     // #F5F5F0

    // Color mixing
    float t = noise * 0.5 + 0.5;
    vec3 col = mix(dark, dark * 1.3, t);
    col += accent * (smoothstep(0.55, 0.75, t) * 0.18 + mouseGlow);
    col += warm * smoothstep(0.8, 1.0, t) * 0.05;

    // Vignette
    float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5) * 1.4);
    col *= vignette;

    gl_FragColor = vec4(col, 1.0);
  }
`;

@Component({
  selector: 'app-shader-background',
  standalone: true,
  template: `<canvas #shaderCanvas class="absolute inset-0 w-full h-full z-0 pointer-events-none"></canvas>`,
})
export class ShaderBackgroundComponent implements OnDestroy {
  @ViewChild('shaderCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer: any;
  private animationId = 0;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(async () => {
      if (!isPlatformBrowser(this.platformId)) return;
      const THREE = await import('three');
      this.initScene(THREE);
    });
  }

  private initScene(THREE: any) {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement!;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
    // Cap pixel ratio at 1.5 for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    this.renderer = renderer;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene = new THREE.Scene();

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(parent.clientWidth, parent.clientHeight) },
      u_mouse: { value: new THREE.Vector2(parent.clientWidth / 2, parent.clientHeight / 2) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      uniforms.u_mouse.value.set(e.clientX - rect.left, parent.clientHeight - (e.clientY - rect.top));
    };
    canvas.parentElement?.addEventListener('mousemove', onMouseMove);

    // Resize
    const onResize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animate at ~30fps for performance
    let lastTime = 0;
    const animate = (now: number) => {
      this.animationId = requestAnimationFrame(animate);
      if (now - lastTime < 33) return; // ~30fps
      lastTime = now;
      uniforms.u_time.value += 0.033;
      renderer.render(scene, camera);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer?.dispose();
  }
}
