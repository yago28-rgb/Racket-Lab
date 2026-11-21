import * as THREE from "three";

/**
 * Real-time WebGL scene for the home hero.
 *
 * A 3840 px photograph of Centre Court is mapped onto a finely subdivided
 * plane whose vertices are pushed towards the camera by a hand-authored depth
 * map (roof and front rows near, far stands deep). A real perspective camera
 * moves through that geometry, so parallax comes from 3D, not sliding layers.
 *
 * Life in the frame: cumulus shadows drift across the grass and the stands,
 * a soft band of sunlight breathes over the court, dust catches the light,
 * and the camera never fully stops. Depth of field is used only while the
 * camera travels; the resting frame is pin sharp.
 */

export interface PlateSpec {
  src: string;
  depth: string;
  mask: string;
  width: number;
  height: number;
  /** Max displacement towards the camera, in world units. */
  relief: number;
}

export interface CameraState {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  /** View-space distance in focus. */
  focus: number;
  /** Blur strength; 0 = sharp. */
  aperture: number;
  exposure: number;
}

const BASE_DISTANCE = 10;
const FOV = 32;

const vertex = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uRelief;
  varying vec2 vUv;
  varying float vViewZ;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += texture2D(uDepth, uv).r * uRelief;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vViewZ = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uMap;
  uniform sampler2D uMask;
  uniform float uFocus;
  uniform float uAperture;
  uniform float uExposure;
  uniform float uTime;
  uniform vec2 uTexel;
  varying vec2 vUv;
  varying float vViewZ;

  const int TAPS = TAP_COUNT;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec4 col;
    float coc = clamp(abs(vViewZ - uFocus) * uAperture, 0.0, 12.0);
    if (coc < 0.6) {
      col = texture2D(uMap, vUv);
    } else {
      vec4 sum = vec4(0.0);
      for (int i = 0; i < TAPS; i++) {
        float a = float(i) * 2.39996323;
        float r = sqrt((float(i) + 0.5) / float(TAPS));
        sum += texture2D(uMap, vUv + vec2(cos(a), sin(a)) * r * coc * uTexel);
      }
      col = sum / float(TAPS);
    }
    vec3 c = col.rgb;

    // Drifting cumulus shadows, strongest on the open grass, softer on the stands.
    float grass = texture2D(uMask, vUv).r;
    vec2 q = vec2(vUv.x * 1.6, vUv.y * 2.4) + vec2(uTime * 0.018, uTime * 0.006);
    float cloud = smoothstep(0.42, 0.72, fbm(q * 2.2));
    float outdoor = smoothstep(0.18, 0.32, vUv.y) * (1.0 - smoothstep(0.86, 1.0, vUv.y));
    float shade = cloud * mix(0.10, 0.26, grass) * outdoor;
    // A slow band of sunlight breathing across the court.
    float band = smoothstep(0.0, 1.0, sin(vUv.x * 2.4 - vUv.y * 1.3 + uTime * 0.11) * 0.5 + 0.5);
    float sun = band * grass * 0.07;
    c *= (1.0 - shade);
    c += c * sun;

    // Editorial grade: warm highlights, deep green shadows.
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(c, c * vec3(1.04, 1.0, 0.92), smoothstep(0.4, 1.0, l) * 0.6);
    c = mix(c, c * vec3(0.9, 1.0, 0.93), (1.0 - smoothstep(0.0, 0.4, l)) * 0.5);
    gl_FragColor = vec4(c * uExposure, 1.0);
  }
`;

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.21 + aSeed * 6.2831) * 0.35 + uTime * 0.02;
    p.y += mod(uTime * 0.05 + aSeed * 3.0, 3.0) - 1.5;
    p.z += cos(uTime * 0.17 + aSeed * 12.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.35 + aSeed) / -mv.z;
    vAlpha = 0.2 + 0.5 * fract(aSeed * 7.13);
    gl_Position = projectionMatrix * mv;
  }
`;

const particleFragment = /* glsl */ `
  precision mediump float;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(1.0, 0.95, 0.82, a * a * vAlpha * uOpacity);
  }
`;

export class CourtScene {
  readonly state: CameraState = { x: 0, y: 0, z: BASE_DISTANCE, tx: 0, ty: 0, focus: BASE_DISTANCE, aperture: 0, exposure: 1 };
  /** Additive offsets driven by scroll and pointer. */
  readonly offset = { x: 0, y: 0, z: 0, tx: 0, ty: 0 };

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  private plate?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private aspect = 1.5;
  private particles?: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private raf = 0;
  private running = false;
  private timer = new THREE.Timer();
  private lookAt = new THREE.Vector3();
  private disposed = false;
  private slowFrames = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: { mobile: boolean },
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.mobile ? 1.75 : 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x0d2219);
  }

  async load(spec: PlateSpec) {
    const loader = new THREE.TextureLoader();
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const tex = (src: string, color: boolean) =>
      loader.loadAsync(src).then((t) => {
        if (color) t.colorSpace = THREE.SRGBColorSpace;
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.anisotropy = color ? maxAniso : 1;
        return t;
      });
    const [map, depth, mask] = await Promise.all([tex(spec.src, true), tex(spec.depth, false), tex(spec.mask, false)]);
    if (this.disposed) return;
    this.aspect = spec.width / spec.height;
    const seg = this.opts.mobile ? [160, 106] : [300, 200];
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      defines: { TAP_COUNT: this.opts.mobile ? 10 : 16 },
      uniforms: {
        uMap: { value: map },
        uDepth: { value: depth },
        uMask: { value: mask },
        uRelief: { value: spec.relief },
        uFocus: { value: BASE_DISTANCE },
        uAperture: { value: 0 },
        uExposure: { value: 1 },
        uTime: { value: 0 },
        uTexel: { value: new THREE.Vector2(1 / spec.width, 1 / spec.height) },
      },
    });
    this.plate = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, seg[0], seg[1]), mat);
    this.scene.add(this.plate);

    const count = this.opts.mobile ? 90 : 200;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = 2 + Math.random() * 6;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    this.particles = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uSize: { value: 22 * this.renderer.getPixelRatio() }, uOpacity: { value: 0.55 } },
      }),
    );
    this.scene.add(this.particles);
    this.resize();
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (!this.plate) return;
    // Cover the viewport at the base distance with a small margin for travel.
    const visH = 2 * BASE_DISTANCE * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const visW = visH * this.camera.aspect;
    const margin = 1.22;
    let pw = visW * margin;
    let ph = pw / this.aspect;
    if (ph < visH * margin) {
      ph = visH * margin;
      pw = ph * this.aspect;
    }
    this.plate.scale.set(pw, ph, 1);
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    const loop = (now: number) => {
      if (!this.running) return;
      this.timer.update(now);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  render() {
    if (!this.plate) return;
    const t = this.timer.getElapsed();
    this.adapt(this.timer.getDelta());
    const s = this.state;
    const o = this.offset;
    // The camera never fully settles: a slow figure-of-eight drift.
    const bx = Math.sin(t * 0.09) * 0.22;
    const by = Math.sin(t * 0.13) * 0.08;
    this.camera.position.set(s.x + o.x + bx, s.y + o.y + by, s.z + o.z);
    this.lookAt.set(s.tx + o.tx + bx * 0.35, s.ty + o.ty + by * 0.35, 0);
    this.camera.lookAt(this.lookAt);

    const u = this.plate.material.uniforms;
    u.uFocus.value = s.focus;
    u.uAperture.value = s.aperture * (this.opts.mobile ? 0.7 : 1);
    u.uExposure.value = s.exposure;
    u.uTime.value = t;
    if (this.particles) {
      this.particles.material.uniforms.uTime.value = t;
      this.particles.material.uniforms.uOpacity.value = 0.55 * s.exposure;
    }
    this.renderer.render(this.scene, this.camera);
  }

  /** Lower the internal resolution on devices that cannot keep up. */
  private adapt(dt: number) {
    if (dt <= 0 || dt > 1) return;
    this.slowFrames = dt > 0.045 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
    const ratio = this.renderer.getPixelRatio();
    if (this.slowFrames > 45 && ratio > 1) {
      this.slowFrames = 0;
      this.renderer.setPixelRatio(Math.max(1, ratio * 0.8));
      this.resize();
    }
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.ShaderMaterial | undefined;
      if (mat) {
        for (const un of Object.values(mat.uniforms ?? {})) if (un.value instanceof THREE.Texture) un.value.dispose();
        mat.dispose();
      }
    });
    this.renderer.dispose();
  }
}
