import * as THREE from "three";

/**
 * Real-time WebGL scene for the home hero.
 *
 * Each photograph is mapped onto a finely subdivided plane whose vertices are
 * pushed towards the camera by a hand-authored depth map (stands far, court in
 * the middle, front rows near). A real perspective camera then dollies
 * through that geometry, so parallax and occlusion come from 3D, not from
 * sliding flat layers. Depth of field is computed per fragment from the
 * view-space distance to the focus plane.
 */

export interface PlateSpec {
  src: string;
  depth: string;
  /** Image aspect ratio (width / height). */
  aspect: number;
  /** Max displacement towards the camera, in world units. */
  relief: number;
}

export interface ForegroundSpec {
  src: string;
  /** Fraction of the full photo height where the cut-out starts (0..1). */
  top: number;
  /** World units in front of the plate. */
  lift: number;
}

export interface CameraState {
  x: number;
  y: number;
  z: number;
  /** Look target. */
  tx: number;
  ty: number;
  /** View-space distance that is in focus. */
  focus: number;
  /** Blur strength (0 = pin sharp). */
  aperture: number;
  /** 0 = stadium plate, 1 = stand plate. */
  mix: number;
  /** Global exposure, 0 = black. */
  exposure: number;
}

const BASE_DISTANCE = 10;
const FOV = 34;

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
  uniform float uFocus;
  uniform float uAperture;
  uniform float uOpacity;
  uniform float uExposure;
  uniform vec2 uTexel;
  uniform float uWarm;
  varying vec2 vUv;
  varying float vViewZ;

  const int TAPS = TAP_COUNT;
  vec2 disk(int i) {
    float a = float(i) * 2.39996323;
    float r = sqrt((float(i) + 0.5) / float(TAPS));
    return vec2(cos(a), sin(a)) * r;
  }

  void main() {
    float coc = clamp(abs(vViewZ - uFocus) * uAperture, 0.0, 14.0);
    vec4 acc = texture2D(uMap, vUv);
    if (coc > 0.35) {
      vec4 sum = vec4(0.0);
      for (int i = 0; i < TAPS; i++) {
        sum += texture2D(uMap, vUv + disk(i) * coc * uTexel, log2(coc) * 0.6);
      }
      acc = sum / float(TAPS);
    }
    vec3 c = acc.rgb;
    // Gentle editorial grade: warm summer highlights, deep green shadows.
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(c, c * vec3(1.05, 1.0, 0.9), uWarm * smoothstep(0.35, 1.0, l));
    c = mix(c, c * vec3(0.86, 0.98, 0.9), uWarm * (1.0 - smoothstep(0.0, 0.45, l)));
    c = mix(vec3(l), c, 0.92);
    gl_FragColor = vec4(c * uExposure, acc.a * uOpacity);
  }
`;

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.21 + aSeed * 6.2831) * 0.35;
    p.y += mod(uTime * 0.06 + aSeed * 3.0, 3.0) - 1.5;
    p.z += cos(uTime * 0.17 + aSeed * 12.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.4 + aSeed) / -mv.z;
    vAlpha = 0.25 + 0.55 * fract(aSeed * 7.13);
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
    gl_FragColor = vec4(1.0, 0.94, 0.8, a * a * vAlpha * uOpacity);
  }
`;

function makeMaterial(map: THREE.Texture, depth: THREE.Texture, relief: number, taps: number) {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    defines: { TAP_COUNT: taps },
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: { value: map },
      uDepth: { value: depth },
      uRelief: { value: relief },
      uFocus: { value: BASE_DISTANCE },
      uAperture: { value: 0 },
      uOpacity: { value: 1 },
      uExposure: { value: 1 },
      uTexel: { value: new THREE.Vector2(1 / 1920, 1 / 1280) },
      uWarm: { value: 0.6 },
    },
  });
}

export class CourtScene {
  readonly state: CameraState = { x: 0, y: 0, z: BASE_DISTANCE, tx: 0, ty: 0, focus: BASE_DISTANCE, aperture: 0, mix: 0, exposure: 1 };
  /** Additive offsets driven by scroll and pointer. */
  readonly offset = { z: 0, y: 0, x: 0, fgDrop: 0, aperture: 0 };

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  private plates: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>; aspect: number }[] = [];
  private fg?: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>; spec: ForegroundSpec };
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
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.mobile ? 1.5 : 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  async load(plates: [PlateSpec, PlateSpec], fg: ForegroundSpec) {
    const loader = new THREE.TextureLoader();
    const tex = (src: string, color: boolean) =>
      loader.loadAsync(src).then((t) => {
        if (color) t.colorSpace = THREE.SRGBColorSpace;
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
        return t;
      });
    const [a, ad, b, bd, f] = await Promise.all([
      tex(plates[0].src, true),
      tex(plates[0].depth, false),
      tex(plates[1].src, true),
      tex(plates[1].depth, false),
      tex(fg.src, true),
    ]);
    if (this.disposed) return;
    const taps = this.opts.mobile ? 10 : 18;
    const seg = this.opts.mobile ? [120, 80] : [220, 146];
    [
      [plates[0], a, ad],
      [plates[1], b, bd],
    ].forEach(([spec, map, depth], i) => {
      const s = spec as PlateSpec;
      const mat = makeMaterial(map as THREE.Texture, depth as THREE.Texture, s.relief, taps);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, seg[0], seg[1]), mat);
      mesh.renderOrder = i;
      this.scene.add(mesh);
      this.plates.push({ mesh, aspect: s.aspect });
    });

    // Foreground silhouettes: a separate plane closer to the camera, scaled so
    // it lines up with the photo from the reference viewpoint.
    const flat = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    flat.needsUpdate = true;
    const fgMat = makeMaterial(f, flat, 0, taps);
    const fgMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fgMat);
    fgMesh.renderOrder = 3;
    this.scene.add(fgMesh);
    this.fg = { mesh: fgMesh, spec: fg };

    // Sunlit dust drifting between camera and court.
    const count = this.opts.mobile ? 110 : 260;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = 1 + Math.random() * 6.5;
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
        uniforms: { uTime: { value: 0 }, uSize: { value: 26 * this.renderer.getPixelRatio() }, uOpacity: { value: 0.7 } },
      }),
    );
    this.particles.renderOrder = 4;
    this.scene.add(this.particles);

    this.resize();
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // Size each plate to cover the viewport at the base distance, with margin
    // for camera travel.
    const visH = 2 * BASE_DISTANCE * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const visW = visH * this.camera.aspect;
    const margin = 1.28;
    for (const p of this.plates) {
      let pw = visW * margin;
      let ph = pw / p.aspect;
      if (ph < visH * margin) {
        ph = visH * margin;
        pw = ph * p.aspect;
      }
      p.mesh.scale.set(pw, ph, 1);
      (p.mesh.material.uniforms.uTexel.value as THREE.Vector2).set(1 / 1920, 1 / 1280);
    }
    if (this.fg && this.plates[1]) {
      const plate = this.plates[1].mesh.scale;
      const k = (BASE_DISTANCE - this.fg.spec.lift) / BASE_DISTANCE;
      const fh = plate.y * (1 - this.fg.spec.top);
      this.fg.mesh.scale.set(plate.x * k, fh * k, 1);
      // Bottom edge of the cut-out sits on the bottom edge of the photo.
      this.fg.mesh.position.set(0, (-plate.y / 2 + fh / 2) * k, this.fg.spec.lift);
    }
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
    if (!this.plates.length) return;
    const t = this.timer.getElapsed();
    this.adapt(this.timer.getDelta());
    const s = this.state;
    const o = this.offset;
    // Slow "breathing" drift keeps the frame alive once the camera settles.
    const bx = Math.sin(t * 0.13) * 0.06;
    const by = Math.cos(t * 0.11) * 0.035;
    this.camera.position.set(s.x + o.x + bx, s.y + o.y + by, s.z + o.z);
    this.lookAt.set(s.tx + bx * 0.4, s.ty + by * 0.4, 0);
    this.camera.lookAt(this.lookAt);

    const aperture = (s.aperture + o.aperture) * (this.opts.mobile ? 0.7 : 1);
    const [a, b] = this.plates;
    for (const [p, op] of [
      [a, 1 - s.mix],
      [b, s.mix],
    ] as const) {
      const u = p.mesh.material.uniforms;
      u.uFocus.value = s.focus;
      u.uAperture.value = aperture;
      u.uOpacity.value = op;
      u.uExposure.value = s.exposure;
      p.mesh.visible = op > 0.002;
    }
    if (this.fg) {
      const u = this.fg.mesh.material.uniforms;
      u.uFocus.value = s.focus;
      u.uAperture.value = aperture;
      u.uOpacity.value = s.mix;
      u.uExposure.value = s.exposure * 0.9;
      this.fg.mesh.visible = s.mix > 0.002;
      this.fg.mesh.position.y = this.fgBaseY() - o.fgDrop;
    }
    if (this.particles) {
      this.particles.material.uniforms.uTime.value = t;
      this.particles.material.uniforms.uOpacity.value = 0.65 * s.exposure;
    }
    this.renderer.render(this.scene, this.camera);
  }

  /** Lower the internal resolution on devices that cannot keep up. */
  private adapt(dt: number) {
    if (dt <= 0 || dt > 1) return;
    this.slowFrames = dt > 0.045 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
    const ratio = this.renderer.getPixelRatio();
    if (this.slowFrames > 45 && ratio > 0.75) {
      this.slowFrames = 0;
      this.renderer.setPixelRatio(Math.max(0.75, ratio * 0.75));
      this.resize();
    }
  }

  private fgBaseY() {
    if (!this.fg || !this.plates[1]) return 0;
    const plate = this.plates[1].mesh.scale;
    const k = (BASE_DISTANCE - this.fg.spec.lift) / BASE_DISTANCE;
    const fh = plate.y * (1 - this.fg.spec.top);
    return (-plate.y / 2 + fh / 2) * k;
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.ShaderMaterial | undefined;
      if (mat) {
        for (const u of Object.values(mat.uniforms ?? {})) if (u.value instanceof THREE.Texture) u.value.dispose();
        mat.dispose();
      }
    });
    this.renderer.dispose();
  }
}

export const HERO_BASE_DISTANCE = BASE_DISTANCE;
