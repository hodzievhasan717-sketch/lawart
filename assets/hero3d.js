/* Lawart — 3D-сцена первого экрана: галактика из звезд, которая по клику собирается в §, весы Фемиды, LEX и книгу */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export function initHero(canvas, opts = {}) {
  try { const t = document.createElement("canvas"); if (!(t.getContext("webgl2") || t.getContext("webgl"))) return null; } catch (e) { return null; }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 760px)").matches;
  const N = mobile ? 20000 : 60000;
  const BG = mobile ? 3500 : 10000;
  const host = canvas.parentElement;
  let W = host.clientWidth, H = host.clientHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000002);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .55;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, .1, 200);
  camera.position.set(0, 0, 9);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), mobile ? .55 : .7, .5, .42);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  const starVS = `
attribute float size; attribute vec3 color; attribute float seed;
uniform float uTime; uniform float uPR;
varying vec3 vColor; varying float vTw;
void main(){
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  float tw = 0.75 + 0.25*sin(uTime*(1.2+seed*2.5) + seed*40.0);
  vTw = tw; vColor = color;
  gl_PointSize = size * uPR * tw * (13.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
  const starFS = `
varying vec3 vColor; varying float vTw;
void main(){
  vec2 p = gl_PointCoord - 0.5; float d = length(p);
  float core = smoothstep(0.5, 0.0, d);
  float a = pow(core, 2.6) * vTw;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * (0.7 + 1.3*pow(core,5.0)), a);
}`;
  const mkMat = () => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() } },
    vertexShader: starVS, fragmentShader: starFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });

  // ---------- палитра ----------
  const C = {
    core: new THREE.Color("#fff1cf"), gold: new THREE.Color("#e3c27d"), cream: new THREE.Color("#f4efe4"),
    blue: new THREE.Color("#8fb4ff"), violet: new THREE.Color("#b48cff"), ox: new THREE.Color("#d24a5e")
  };

  // ---------- галактика: балдж, спиральные рукава, области звездообразования ----------
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283 * v); };
  const R = 5.6, ARMS = 2, WIND = 2.6;
  const armAngle = r => Math.log(1 + r * 1.6) * WIND;
  const KNOTS = Array.from({ length: 70 }, () => { const r = .9 + Math.random() * (R - 1.4), a = ((Math.random() * ARMS) | 0) * Math.PI + armAngle(r) + gauss() * .08; return [Math.cos(a) * r, Math.sin(a) * r]; });
  function galaxy(n) {
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), kind = new Uint8Array(n);
    const c = new THREE.Color();
    const HII = new THREE.Color("#ff6f91"), YOUNG = new THREE.Color("#9cc4ff"), OLD = new THREE.Color("#ffd9a0"), WHITE = new THREE.Color("#fff6e8");
    for (let i = 0; i < n; i++) {
      const roll = Math.random();
      let x, y, z;
      if (roll < .2) { // балдж: плотное теплое ядро
        const r = Math.abs(gauss()) * .55;
        const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(ph) * Math.cos(th) * 1.25; y = r * Math.cos(ph) * .55; z = r * Math.sin(ph) * Math.sin(th) * 1.25;
        c.copy(OLD).lerp(WHITE, Math.random() * .5); kind[i] = 1;
      } else if (roll < .26) { // области звездообразования (розовые узлы)
        const k = KNOTS[(Math.random() * KNOTS.length) | 0], s2 = .09 + Math.random() * .08;
        x = k[0] + gauss() * s2; z = k[1] + gauss() * s2; y = gauss() * .04;
        c.copy(Math.random() < .55 ? HII : YOUNG); kind[i] = 2;
      } else if (roll < .3) { // гало: редкие старые звезды
        const r = 1 + Math.random() * 6.5, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph) * .6; z = r * Math.sin(ph) * Math.sin(th);
        c.copy(OLD).lerp(WHITE, .5); kind[i] = 3;
      } else { // рукава
        const r = .35 + Math.pow(Math.random(), 1.25) * (R - .35);
        const arm = ((Math.random() * ARMS) | 0) * Math.PI;
        const w = (.12 + r * .07) * gauss();
        const a = arm + armAngle(r) + w;
        const rr = r + gauss() * .12;
        x = Math.cos(a) * rr; z = Math.sin(a) * rr; y = gauss() * (.09 - r * .008);
        const t = r / R;
        c.copy(OLD).lerp(WHITE, Math.min(1, t * 1.6));
        if (t > .3) c.lerp(YOUNG, Math.min(1, (t - .3) * 1.5) * (Math.abs(w) < .08 ? 1 : .45));
        if (Math.random() < .02) c.copy(HII);
        kind[i] = 0;
      }
      pos.set([x, y, z], i * 3);
      const b = .75 + Math.random() * .5; col.set([c.r * b, c.g * b, c.b * b], i * 3);
    }
    return { pos, col, kind };
  }
  function dust(n) { // пылевые полосы на внутренней стороне рукавов
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = .7 + Math.pow(Math.random(), 1.1) * (R - 1);
      const a = ((Math.random() * ARMS) | 0) * Math.PI + armAngle(r) - .16 + gauss() * .06;
      pos.set([Math.cos(a) * r + gauss() * .05, gauss() * .03, Math.sin(a) * r + gauss() * .05], i * 3);
    }
    return pos;
  }
  function gas(n) { // мягкие облака газа вдоль рукавов
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const cs = [new THREE.Color("#5a7dff"), new THREE.Color("#ff5d8a"), new THREE.Color("#8a5cff"), new THREE.Color("#ffb46b")];
    for (let i = 0; i < n; i++) {
      const r = .4 + Math.pow(Math.random(), 1.2) * (R - .6);
      const a = ((Math.random() * ARMS) | 0) * Math.PI + armAngle(r) + gauss() * .18;
      pos.set([Math.cos(a) * r, gauss() * .05, Math.sin(a) * r], i * 3);
      const c = r < 1.2 ? cs[3] : cs[Math.random() < .55 ? 0 : Math.random() < .5 ? 2 : 1]; col.set([c.r, c.g, c.b], i * 3);
    }
    return { pos, col };
  }

  // ---------- фигуры из точек ----------
  function sampleCanvas(draw, n, w = 520, h = 520, scale = 4.4, depth = .35) {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const g = cv.getContext("2d"); g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.strokeStyle = "#fff";
    draw(g, w, h);
    const data = g.getImageData(0, 0, w, h).data, pts = [];
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4] > 128) pts.push([x, y]);
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const p = pts[(Math.random() * pts.length) | 0];
      out[i * 3] = (p[0] / w - .5) * scale + (Math.random() - .5) * .02;
      out[i * 3 + 1] = -(p[1] / h - .5) * scale + (Math.random() - .5) * .02;
      out[i * 3 + 2] = (Math.random() - .5) * depth;
    }
    return out;
  }
  function shapeSection(n) { return sampleCanvas((g, w, h) => { g.font = `bold ${h * .92}px Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("§", w / 2, h * .54); }, n); }
  function shapeLex(n) { return sampleCanvas((g, w, h) => { g.font = `600 ${h * .42}px Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("LEX", w / 2, h / 2); }, n, 900, 420, 6.2); }
  function shapeScales(n) {
    return sampleCanvas((g, w, h) => {
      g.lineWidth = 12; g.lineCap = "round";
      const cx = w / 2;
      g.beginPath(); g.moveTo(cx, h * .14); g.lineTo(cx, h * .84); g.stroke();
      g.beginPath(); g.moveTo(cx - w * .34, h * .24); g.lineTo(cx + w * .34, h * .24); g.stroke();
      g.beginPath(); g.arc(cx, h * .12, 16, 0, 7); g.fill();
      g.fillRect(cx - w * .16, h * .82, w * .32, 16);
      for (const s of [-1, 1]) {
        const x = cx + s * w * .34;
        g.lineWidth = 5; g.beginPath(); g.moveTo(x, h * .24); g.lineTo(x - w * .1, h * .52); g.moveTo(x, h * .24); g.lineTo(x + w * .1, h * .52); g.stroke();
        g.lineWidth = 12; g.beginPath(); g.arc(x, h * .52, w * .11, 0, Math.PI); g.stroke();
      }
    }, n);
  }
  function shapeBook(n) {
    const out = new Float32Array(n * 3), PW = 1.9, PH = 1.3;
    const curve = x => .38 * Math.sqrt(Math.min(1, Math.abs(x) / PW));
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1, r = Math.random();
      let ax, y;
      if (r < .14) { if (Math.random() < .5) { ax = .04 + Math.random() * (PW - .04); y = (Math.random() < .5 ? -1 : 1) * PH; } else { ax = PW; y = (Math.random() * 2 - 1) * PH; } }
      else if (r < .88) { const rows = 14, k = (Math.random() * rows) | 0; ax = .18 + Math.random() * (PW - .36) * (k % 5 === 4 ? .6 : .92); y = PH - .24 - k * ((2 * PH - .48) / (rows - 1)); }
      else { ax = .04 + Math.random() * (PW - .04); y = (Math.random() * 2 - 1) * PH; }
      const x = side * ax;
      out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = curve(x) + (Math.random() - .5) * .01;
    }
    return out;
  }


  const gal = galaxy(N);
  const SHAPES = [
    { pos: gal.pos, tilt: 1.0, spin: .03, scale: .48 },
    { pos: shapeSection(N), tilt: 0, spin: 0, scale: .78 },
    { pos: shapeScales(N), tilt: 0, spin: 0, scale: .78 },
    { pos: shapeLex(N), tilt: 0, spin: 0, scale: .7 },
    { pos: shapeBook(N), tilt: -.45, spin: 0, scale: .74 }
  ];
  const BOOK = 4;

  const geo = new THREE.BufferGeometry();
  const cur = new Float32Array(gal.pos);
  const sizes = new Float32Array(N), seeds = new Float32Array(N), speed = new Float32Array(N);
  for (let i = 0; i < N; i++) { sizes[i] = (gal.kind[i] === 2 ? 1.3 : gal.kind[i] === 1 ? .9 : .75) * (Math.random() < .015 ? 3 + Math.random() * 2.5 : .6 + Math.pow(Math.random(), 3) * 2.2); seeds[i] = Math.random(); speed[i] = .025 + Math.random() * .05; }
  geo.setAttribute("position", new THREE.BufferAttribute(cur, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(gal.col, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
  const mat = mkMat();
  const group = new THREE.Group(); group.add(new THREE.Points(geo, mat)); scene.add(group); group.scale.setScalar(.48);

  const gasD = gas(mobile ? 500 : 1300);
  const gasGeo = new THREE.BufferGeometry();
  gasGeo.setAttribute("position", new THREE.BufferAttribute(gasD.pos, 3));
  gasGeo.setAttribute("color", new THREE.BufferAttribute(gasD.col, 3));
  const gasMat = new THREE.ShaderMaterial({
    uniforms: { uO: { value: 1 }, uPR: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute vec3 color; varying vec3 vC; uniform float uPR; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=uPR*520.0/-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vC; uniform float uO; void main(){ float d=length(gl_PointCoord-0.5); float a=pow(smoothstep(0.5,0.0,d),2.4)*0.022*uO; gl_FragColor=vec4(vC,a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  group.add(new THREE.Points(gasGeo, gasMat));
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute("position", new THREE.BufferAttribute(dust(mobile ? 3000 : 8000), 3));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: { uO: { value: 1 }, uPR: { value: renderer.getPixelRatio() } },
    vertexShader: `uniform float uPR; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=uPR*150.0/-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform float uO; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.0,d)*0.16*uO; gl_FragColor=vec4(0.03,0.015,0.01,a); }`,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending
  });
  const dustPts = new THREE.Points(dustGeo, dustMat); dustPts.renderOrder = 2; group.add(dustPts);

  function glowTex(inner, outer) {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, inner); gr.addColorStop(.35, outer); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
  }
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex("rgba(255,236,200,.95)", "rgba(227,170,90,.25)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  core.scale.set(3.2, 3.2, 1); group.add(core);
  const nebulae = [];
  [["rgba(120,90,255,.35)", "rgba(80,60,200,.08)", -3.5, .6, -2], ["rgba(70,140,255,.30)", "rgba(40,90,200,.07)", 3.8, -.8, -3], ["rgba(210,74,94,.22)", "rgba(140,30,45,.05)", .5, 1.6, -4]].forEach(([a, b, x, y, z]) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(a, b), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .14 }));
    s.position.set(x, y, z); s.scale.set(9, 9, 1); scene.add(s); nebulae.push(s);
  });
  function flareTex() {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 60); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.25, "rgba(255,240,210,.55)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.globalCompositeOperation = "lighter";
    for (const [w, h] of [[256, 3], [3, 256]]) { const l = g.createLinearGradient(128 - w / 2, 128 - h / 2, 128 + w / 2, 128 + h / 2); l.addColorStop(0, "rgba(255,255,255,0)"); l.addColorStop(.5, "rgba(255,245,225,.9)"); l.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = l; g.fillRect(128 - w / 2, 128 - h / 2, w, h); }
    return new THREE.CanvasTexture(c);
  }
  const FT = flareTex(), flares = [];
  for (let i = 0; i < (mobile ? 6 : 12); i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: FT, color: new THREE.Color().setHSL(Math.random() < .5 ? .6 : .1, .5, .85), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    sp.userData = { k: (Math.random() * N) | 0, s: .25 + Math.random() * .35, ph: Math.random() * 6 }; group.add(sp); flares.push(sp);
  }
  const bgGeo = new THREE.BufferGeometry(), bp = new Float32Array(BG * 3), bc = new Float32Array(BG * 3), bs = new Float32Array(BG), bd = new Float32Array(BG);
  for (let i = 0; i < BG; i++) {
    const r = 30 + Math.random() * 60, th = Math.random() * 6.283, ph = Math.random() < .55 ? Math.PI / 2 + .55 + gauss() * .12 : Math.acos(2 * Math.random() - 1);
    bp.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3);
    const col = Math.random() < .2 ? C.blue : Math.random() < .2 ? C.gold : C.cream; bc.set([col.r, col.g, col.b], i * 3);
    bs[i] = 1.6 + Math.pow(Math.random(), 2) * 6; bd[i] = Math.random();
  }
  bgGeo.setAttribute("position", new THREE.BufferAttribute(bp, 3)); bgGeo.setAttribute("color", new THREE.BufferAttribute(bc, 3));
  bgGeo.setAttribute("size", new THREE.BufferAttribute(bs, 1)); bgGeo.setAttribute("seed", new THREE.BufferAttribute(bd, 1));
  const bgMat = mkMat(); const bg = new THREE.Points(bgGeo, bgMat); scene.add(bg);

  // лист, который перелистывается в режиме книги
  const FN = mobile ? 900 : 2200, PW = 1.9, PH = 1.3;
  const curve = x => .38 * Math.sqrt(Math.min(1, Math.abs(x) / PW));
  const sheetBase = new Float32Array(FN * 3), sheetPos = new Float32Array(FN * 3), sS = new Float32Array(FN), sD = new Float32Array(FN), sC = new Float32Array(FN * 3);
  for (let i = 0; i < FN; i++) {
    const r = Math.random(); let ax, y;
    if (r < .2) { ax = Math.random() < .5 ? PW : .05 + Math.random() * (PW - .05); y = ax === PW ? (Math.random() * 2 - 1) * PH : (Math.random() < .5 ? -1 : 1) * PH; }
    else { const k = (Math.random() * 14) | 0; ax = .18 + Math.random() * (PW - .36) * .92; y = PH - .24 - k * ((2 * PH - .48) / 13); }
    sheetBase.set([ax, y, curve(ax)], i * 3); sS[i] = 1.4 + Math.random(); sD[i] = Math.random(); sC.set([1, .93, .8], i * 3);
  }
  const shGeo = new THREE.BufferGeometry();
  shGeo.setAttribute("position", new THREE.BufferAttribute(sheetPos, 3)); shGeo.setAttribute("size", new THREE.BufferAttribute(sS, 1));
  shGeo.setAttribute("seed", new THREE.BufferAttribute(sD, 1)); shGeo.setAttribute("color", new THREE.BufferAttribute(sC, 3));
  const shMat = mkMat(); const sheet = new THREE.Points(shGeo, shMat); sheet.visible = false; group.add(sheet);
  let flipT = -1, flipQ = 0;
  const flipPage = () => { if (flipT < 0) flipT = 0; else flipQ = Math.min(flipQ + 1, 3); };
  function updateSheet(dt) {
    if (flipT < 0) { sheet.visible = false; return; }
    sheet.visible = true; flipT += dt / 1.1;
    const t = Math.min(1, flipT), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, th = e * Math.PI;
    for (let i = 0; i < FN; i++) {
      const j = i * 3, x = sheetBase[j], a = th + .5 * Math.sin(th) * (x / PW);
      sheetPos[j] = x * Math.cos(a); sheetPos[j + 1] = sheetBase[j + 1]; sheetPos[j + 2] = sheetBase[j + 2] * Math.cos(th) + x * Math.sin(a);
    }
    shGeo.attributes.position.needsUpdate = true;
    if (flipT >= 1) { if (flipQ > 0) { flipQ--; flipT = 0; } else flipT = -1; }
  }

  let idx = 0, target = SHAPES[0].pos, scatterT = 0, idle = 99, shapeT = 0;
  function setTarget(i) {
    idx = (i + SHAPES.length) % SHAPES.length; target = SHAPES[idx].pos; scatterT = 1; shapeT = 0;
    for (let k = 0; k < N; k++) speed[k] = .02 + Math.random() * .05;
    if (idx !== BOOK) { flipT = -1; flipQ = 0; }
    if (opts.onShape) opts.onShape(idx);
  }

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; }, { passive: true });
  const place = () => { group.position.x = W > 900 ? 3.2 : 0; group.position.y = W > 900 ? 0 : 1.2; };
  place();
  new ResizeObserver(() => {
    W = host.clientWidth; H = host.clientHeight; if (!W || !H) return;
    camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H, false); composer.setSize(W, H); place();
  }).observe(host);

  const v = new THREE.Vector3(), v2 = new THREE.Vector3();
  function hit(e) {
    const r = canvas.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) return false;
    group.getWorldPosition(v); v2.copy(v); v2.x += 3.2 * group.scale.x;
    v.project(camera); v2.project(camera);
    const cx = r.left + (v.x + 1) / 2 * r.width, cy = r.top + (1 - v.y) / 2 * r.height;
    return Math.hypot(e.clientX - cx, e.clientY - cy) < Math.abs((v2.x - v.x) / 2 * r.width);
  }
  host.addEventListener("click", e => {
    if (e.target.closest("a,button,input,textarea,select,label,form,.hs-res,.hero-stats")) return;
    if (!hit(e)) return;
    idle = 0;
    if (idx === BOOK && shapeT > .8) flipPage(); else setTarget(idx + 1);
  });
  host.addEventListener("pointermove", e => {
    if (e.target.closest("a,button,input,textarea,select,label,form")) { host.style.cursor = ""; return; }
    host.style.cursor = hit(e) ? "pointer" : "";
  }, { passive: true });

  let visible = true, running = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }).observe(host);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  const clock = new THREE.Clock(); let spinA = 0;
  function frame() {
    if (!visible || document.hidden) { running = false; return; }
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    mat.uniforms.uTime.value = t; bgMat.uniforms.uTime.value = t; shMat.uniforms.uTime.value = t;
    idle += dt; shapeT += dt;
    if (!reduced && idle > 16 && shapeT > (idx === 0 ? 14 : 7)) setTarget(idx + 1);
    scatterT = Math.max(0, scatterT - dt * 1.4);
    const p = geo.attributes.position.array, k = Math.min(1, dt * 60);
    for (let i = 0; i < N; i++) {
      const j = i * 3, s = speed[i] * k, burst = scatterT * .045 * Math.sin(seeds[i] * 50);
      p[j] += (target[j] - p[j]) * s + burst; p[j + 1] += (target[j + 1] - p[j + 1]) * s + burst * .6; p[j + 2] += (target[j + 2] - p[j + 2]) * s - burst;
    }
    geo.attributes.position.needsUpdate = true;
    updateSheet(dt);
    const S = SHAPES[idx], gOn = idx === 0 ? 1 : 0;
    spinA += dt * S.spin;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    const baseY = S.spin ? spinA : Math.sin(t * .35) * .22;
    group.rotation.y += (baseY + mouse.x * .5 - group.rotation.y) * .08;
    group.rotation.x += (S.tilt + mouse.y * .3 - group.rotation.x) * .05;
    group.scale.setScalar(group.scale.x + (S.scale - group.scale.x) * .05);
    bloom.strength += ((gOn ? (mobile ? .35 : .42) : .3) - bloom.strength) * .05;
    core.material.opacity += ((gOn ? .55 : .12) - core.material.opacity) * .05;
    gasMat.uniforms.uO.value += (gOn - gasMat.uniforms.uO.value) * .06;
    dustMat.uniforms.uO.value += (gOn - dustMat.uniforms.uO.value) * .06;
    for (const f of flares) { const j = f.userData.k * 3; f.position.set(p[j], p[j + 1], p[j + 2]); const sc = f.userData.s * (.8 + .25 * Math.sin(t * 1.7 + f.userData.ph)); f.scale.set(sc, sc, 1); f.material.opacity = (.2 + .35 * gOn); }
    nebulae.forEach((n, q) => { n.material.rotation = t * .02 * (q % 2 ? 1 : -1); });
    bg.rotation.y = t * .004;
    camera.position.x += (mouse.x * .5 - camera.position.x) * .03; camera.position.y += (-mouse.y * .3 - camera.position.y) * .03;
    camera.lookAt(0, 0, 0);
    composer.render();
    requestAnimationFrame(frame);
  }
  function start() { if (running || !visible) return; running = true; clock.getDelta(); requestAnimationFrame(frame); }
  if (reduced) { for (let i = 0; i < cur.length; i++) cur[i] = gal.pos[i]; group.rotation.x = 1; group.scale.setScalar(.48); composer.render(); }
  else start();
  canvas.classList.add("ready");
  return { next: () => { idle = 0; setTarget(idx + 1); }, flip: flipPage, isBook: () => idx === BOOK };
}
