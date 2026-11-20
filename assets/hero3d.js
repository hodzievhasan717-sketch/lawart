/* Lawart — 3D-сцена первого экрана: частицы складываются в шар, §, весы Фемиды и LEX */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const SIZE = 240;

function sample2D(draw, n) {
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.strokeStyle = "#fff";
  draw(g);
  const img = g.getImageData(0, 0, SIZE, SIZE).data;
  const px = [];
  for (let y = 0; y < SIZE; y += 1) for (let x = 0; x < SIZE; x += 1) if (img[(y * SIZE + x) * 4 + 3] > 120) px.push(x, y);
  const out = new Float32Array(n * 3);
  const cnt = px.length / 2;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(Math.random() * cnt) * 2;
    out[i * 3] = ((px[k] + Math.random()) / SIZE - .5) * 3.3;
    out[i * 3 + 1] = -((px[k + 1] + Math.random()) / SIZE - .5) * 3.3;
    out[i * 3 + 2] = (Math.random() - .5) * .42;
  }
  return out;
}

function sphere(n, r = 1.3) {
  const out = new Float32Array(n * 3), ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), t = ga * i;
    const rr = r * (0.94 + Math.random() * .08);
    out[i * 3] = Math.cos(t) * rad * rr; out[i * 3 + 1] = y * rr; out[i * 3 + 2] = Math.sin(t) * rad * rr;
  }
  return out;
}

function shapes(n) {
  const serif = 'Georgia, "Times New Roman", serif';
  const section = sample2D(g => {
    g.font = `700 210px ${serif}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("§", SIZE / 2, SIZE / 2 + 8);
  }, n);
  const scales = sample2D(g => {
    g.lineCap = "round"; g.lineWidth = 9;
    g.beginPath(); g.moveTo(120, 46); g.lineTo(120, 196); g.stroke();
    g.beginPath(); g.moveTo(34, 66); g.lineTo(206, 66); g.stroke();
    g.beginPath(); g.arc(120, 42, 11, 0, Math.PI * 2); g.fill();
    g.fillRect(78, 192, 84, 12); g.fillRect(100, 182, 40, 12);
    g.lineWidth = 4;
    [[44, 66], [196, 66]].forEach(([x, y]) => {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 26, y + 66); g.moveTo(x, y); g.lineTo(x + 26, y + 66); g.stroke();
      g.beginPath(); g.arc(x, y + 64, 30, 0, Math.PI); g.fill();
    });
  }, n);
  const lex = sample2D(g => {
    g.font = `700 104px ${serif}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("LEX", SIZE / 2, SIZE / 2 + 4);
  }, n);
  return [sphere(n), section, scales, lex];
}

function sprite() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(.25, "rgba(255,255,255,.85)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function initHero(canvas, opts = {}) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return null; }
  const mobile = innerWidth < 760;
  const N = mobile ? 3600 : 8200;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.8));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  camera.position.set(0, 0, 6.2);

  const tex = sprite();
  const group = new THREE.Group();
  scene.add(group);

  const targets = shapes(N);
  const pos = new Float32Array(targets[0].length);
  for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - .5) * 9;
  const speed = new Float32Array(N), phase = new Float32Array(N);
  const col = new Float32Array(N * 3);
  const palette = [new THREE.Color("#e8c98a"), new THREE.Color("#c9a35c"), new THREE.Color("#f4ead2"), new THREE.Color("#a8823f"), new THREE.Color("#c2404f")];
  for (let i = 0; i < N; i++) {
    speed[i] = .028 + Math.random() * .05;
    phase[i] = Math.random() * Math.PI * 2;
    const r = Math.random(), c = r < .05 ? palette[4] : r < .38 ? palette[0] : r < .7 ? palette[1] : r < .88 ? palette[2] : palette[3];
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: mobile ? .05 : .042, map: tex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: .95 });
  const pts = new THREE.Points(geo, mat);
  group.add(pts);

  // кольцо-орбита
  const RN = mobile ? 500 : 1100;
  const ring = new Float32Array(RN * 3);
  for (let i = 0; i < RN; i++) {
    const a = Math.random() * Math.PI * 2, r = 2.15 + (Math.random() - .5) * .22;
    ring[i * 3] = Math.cos(a) * r; ring[i * 3 + 1] = (Math.random() - .5) * .06; ring[i * 3 + 2] = Math.sin(a) * r;
  }
  const rgeo = new THREE.BufferGeometry();
  rgeo.setAttribute("position", new THREE.BufferAttribute(ring, 3));
  const rmat = new THREE.PointsMaterial({ size: .022, map: tex, color: new THREE.Color("#d9b46e"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55 });
  const orbit = new THREE.Points(rgeo, rmat);
  orbit.rotation.x = 1.15; orbit.rotation.y = .3;
  group.add(orbit);

  // звездная пыль на фоне
  const SN = mobile ? 300 : 700;
  const stars = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) { stars[i * 3] = (Math.random() - .5) * 22; stars[i * 3 + 1] = (Math.random() - .5) * 13; stars[i * 3 + 2] = -3 - Math.random() * 8; }
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute("position", new THREE.BufferAttribute(stars, 3));
  const smat = new THREE.PointsMaterial({ size: .03, map: tex, color: new THREE.Color("#efe3c4"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .45 });
  const dust = new THREE.Points(sgeo, smat);
  scene.add(dust);

  let shapeIdx = 0, shapeT = 0;
  const HOLD = 4.6;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = e => { mouse.tx = (e.clientX / innerWidth - .5) * 2; mouse.ty = (e.clientY / innerHeight - .5) * 2; };
  addEventListener("pointermove", onMove, { passive: true });

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const wide = w > 980;
    group.position.x = wide ? 1.75 : 0;
    group.position.y = wide ? 0 : .35;
    const s = wide ? 1 : w < 520 ? .78 : .9;
    group.scale.setScalar(s);
    pts.material.opacity = wide ? .95 : .5;
  }
  layout();
  addEventListener("resize", layout);

  let running = true, visible = true, raf = 0, last = performance.now(), time = 0;
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && running && !reduced) { last = performance.now(); loop(); } });
  io.observe(canvas);
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running && !reduced) { last = performance.now(); loop(); } });

  function setTarget(i) { shapeIdx = i % targets.length; shapeT = 0; }
  if (opts.onShape) opts.onShape(0);

  function frame(dt) {
    time += dt;
    shapeT += dt;
    if (!reduced && shapeT > HOLD) { setTarget(shapeIdx + 1); if (opts.onShape) opts.onShape(shapeIdx); }
    const tgt = targets[shapeIdx];
    const p = geo.attributes.position.array;
    const k = Math.min(1, dt * 60);
    for (let i = 0; i < N; i++) {
      const j = i * 3, s = speed[i] * k, w = Math.sin(time * 1.3 + phase[i]) * .012;
      p[j] += (tgt[j] - p[j]) * s + w;
      p[j + 1] += (tgt[j + 1] - p[j + 1]) * s + Math.cos(time * 1.1 + phase[i]) * .01;
      p[j + 2] += (tgt[j + 2] - p[j + 2]) * s;
    }
    geo.attributes.position.needsUpdate = true;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    const spin = shapeIdx === 0 ? time * .25 : Math.sin(time * .35) * .32;
    pts.rotation.y = spin + mouse.x * .35;
    pts.rotation.x = mouse.y * .18;
    orbit.rotation.z = time * .08;
    dust.rotation.y = time * .01 + mouse.x * .05;
    dust.position.y = -mouse.y * .15;
  }
  function loop() {
    cancelAnimationFrame(raf);
    if (!running || !visible) return;
    raf = requestAnimationFrame(t => {
      const dt = Math.min(.05, (t - last) / 1000); last = t;
      frame(dt);
      renderer.render(scene, camera);
      loop();
    });
  }
  if (reduced) {
    for (let i = 0; i < pos.length; i++) pos[i] = targets[0][i];
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  } else loop();

  canvas.classList.add("ready");
  return { next: () => { setTarget(shapeIdx + 1); if (opts.onShape) opts.onShape(shapeIdx); } };
}
