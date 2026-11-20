/* Lawart.uz — ядро сайта */
const CFG = window.LAWART_CONFIG;
const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);

const RUBRICS = [
  ["Теория государства и права", "Правопонимание, источники права, толкование"],
  ["Конституционное право", "Права человека, органы власти, конституционный контроль"],
  ["Гражданское право", "Собственность, обязательства, договоры, наследование"],
  ["Предпринимательское право", "Компании, инвестиции, корпоративное управление"],
  ["Трудовое право", "Трудовой договор, заработная плата, трудовые споры"],
  ["Семейное право", "Брак, дети, алименты, опека"],
  ["Социальное право и права ребенка", "Социальная защита, опека, права детей"],
  ["Уголовное право и криминология", "Преступление, наказание, причины преступности"],
  ["Уголовный процесс", "Следствие, доказательства, судебное разбирательство"],
  ["Административное право", "Государственное управление, административная ответственность"],
  ["Международное право", "Договоры, организации, международные стандарты"],
  ["Спортивное право", "Спортивные контракты, lex sportiva, честность спорта"],
  ["Цифровое право и LegalTech", "Данные, искусственный интеллект, смарт-контракты"],
  ["Противодействие коррупции", "Антикоррупционные стандарты, комплаенс, ответственность"],
  ["Судебная практика", "Разбор решений и правовых позиций судов"]
];
const RUBRIC_NAMES = RUBRICS.map(r => r[0]);
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"];
const LANGS = { ru: "Русский", uz: "O‘zbekcha", en: "English" };

const MAXIMS = [
  ["Pacta sunt servanda", "Договоры должны исполняться", "Основа договорного права. В международном праве этот принцип закреплен в статье 26 Венской конвенции о праве международных договоров 1969 года."],
  ["Audiatur et altera pars", "Пусть будет выслушана и другая сторона", "Суд не может решить дело, не дав каждой стороне высказаться. Отсюда выросли принципы состязательности и равноправия сторон."],
  ["Nemo iudex in causa sua", "Никто не может быть судьей в собственном деле", "Основание для отвода судьи и правил о конфликте интересов: решающий не должен быть заинтересован в исходе."],
  ["Ignorantia iuris non excusat", "Незнание закона не освобождает от ответственности", "Поэтому законы официально публикуются: каждый имеет возможность узнать правило до того, как его применят."],
  ["Lex specialis derogat generali", "Специальный закон вытесняет общий", "Если два правила противоречат друг другу, применяется то, которое рассчитано именно на данный случай."],
  ["Lex posterior derogat priori", "Последующий закон отменяет предыдущий", "При коллизии актов одной силы действует более поздний, если законодатель прямо не решил иначе."],
  ["In dubio pro reo", "Сомнения толкуются в пользу обвиняемого", "Неустранимые сомнения в виновности не могут обернуться против человека, которого обвиняют."],
  ["Nullum crimen, nulla poena sine lege", "Нет преступления и наказания без закона", "Нельзя наказать за деяние, которое на момент совершения не было признано преступлением."],
  ["Non bis in idem", "Нельзя дважды за одно и то же", "Никто не должен повторно нести ответственность за правонарушение, за которое уже осужден или оправдан."],
  ["Ubi ius, ibi remedium", "Где есть право, там есть и средство защиты", "Право без способа его защитить остается декларацией. Поэтому у каждого права должен быть путь в суд."],
  ["Actori incumbit probatio", "Бремя доказывания лежит на истце", "Тот, кто требует, должен доказать основания своего требования."],
  ["Volenti non fit iniuria", "Согласившемуся не причиняется обида", "Кто добровольно принял известный ему риск, по общему правилу не может требовать возмещения. Классический пример: контактные виды спорта."],
  ["Qui tacet, consentire videtur", "Молчание считается согласием", "Знаменитая максима с оговоркой: в договорном праве молчание обычно не является акцептом, если иное не следует из закона, обычая или прежних отношений сторон."],
  ["Res iudicata pro veritate habetur", "Решенное судом признается истиной", "Вступившее в силу решение обязательно, и тот же спор между теми же сторонами нельзя рассматривать заново."],
  ["Dura lex, sed lex", "Закон суров, но это закон", "Правило действует и тогда, когда кажется неудобным. Менять его можно только законным путем."]
];
function maxim(i) {
  const m = MAXIMS[(i % MAXIMS.length + MAXIMS.length) % MAXIMS.length];
  const idx = MAXIMS.indexOf(m);
  const tr = LANG === "ru" ? [m[1], m[2]] : MAXIM_I18N[LANG][idx];
  return { latin: m[0], tr: tr[0], ex: tr[1], idx };
}

const ICON = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  dice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  quote: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.6 6C6.5 7.3 4.5 10 4.5 13.6V18h6v-6H7.2c.2-2 1.4-3.5 3.3-4.4zm9 0c-3.1 1.3-5.1 4-5.1 7.6V18h6v-6h-3.3c.2-2 1.4-3.5 3.3-4.4z"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5m0 0-6 6m6-6 6 6"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>'
};

const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lgG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ecd29a"/><stop offset="1" stop-color="#a7813f"/></linearGradient></defs><circle cx="20" cy="20" r="19" fill="#0e0f13"/><circle cx="20" cy="20" r="15.6" fill="none" stroke="url(#lgG)" stroke-width=".9"/><path d="M14 11h4.2v15.2h8.3V30H14z" fill="#f3eee3"/><circle cx="27.5" cy="13.5" r="2.3" fill="#b8323f"/></svg>`;

/* ---------- утилиты ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const qs = k => new URLSearchParams(location.search).get(k);
const clean = s => String(s).replace(/\s?г\.$/, "").replace(" г.", "");
const UZ_M = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const uzDate = (d, short) => { const x = new Date(d); const m = UZ_M[x.getMonth()]; return `${x.getDate()}-${short && m.length > 5 ? m.slice(0, 3) + "." : m} ${x.getFullYear()}`; };
const fmtDate = d => d ? (LANG === "uz" ? uzDate(d) : clean(new Date(d).toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" }))) : "";
const fmtShort = d => d ? (LANG === "uz" ? uzDate(d, true) : clean(new Date(d).toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" }))) : "";
const fmtTime = d => new Date(d).toLocaleString(LOCALE, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const hm = d => new Date(d).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
const initials = n => (n || "?").replace(/[«»"']/g, "").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";
const statusLabel = s => t("st." + s);
const badge = s => `<span class="badge b-${esc(s)}">${esc(statusLabel(s))}</span>`;
const num = n => Number(n || 0).toLocaleString(LOCALE).replace(/\u202f|\u00a0/g, " ");
const pad = id => String(id).padStart(3, "0");
const debounce = (fn, ms) => { let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); }; };
const YO = /\u0451/g;
const norm = s => String(s || "").toLowerCase().replace(YO, "е").replace(/[‘’ʻʼ`´']/g, "'").replace(/\s+/g, " ").trim();
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};
const readMin = a => a && a.pages ? Math.max(3, Math.round(a.pages * 2.5)) : 0;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

function siteUrl() {
  if (/lawart\.uz$/.test(location.hostname)) return "https://lawart.uz/";
  return location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
}
function toast(text, ms = 2800) {
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = text;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("in"));
  setTimeout(() => { el.classList.remove("in"); setTimeout(() => el.remove(), 300); }, ms);
}
function confirmBox(title, text, yes) {
  return new Promise(res => {
    const m = document.createElement("div"); m.className = "modal-bg";
    m.innerHTML = `<div class="modal" style="max-width:460px"><h3>${esc(title)}</h3><p class="muted">${esc(text)}</p><div class="actions"><button class="btn red" data-y>${esc(yes || t("c.yes"))}</button><button class="btn ghost" data-n>${t("c.cancel")}</button></div></div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add("in"));
    const close = v => { m.remove(); res(v); };
    $("[data-y]", m).onclick = () => close(true);
    $("[data-n]", m).onclick = () => close(false);
    m.onclick = e => { if (e.target === m) close(false); };
  });
}
function modal(html, cls = "") {
  const m = document.createElement("div"); m.className = "modal-bg";
  m.innerHTML = `<div class="modal ${cls}"><button class="modal-x" type="button" aria-label="${t("p.close")}">×</button>${html}</div>`;
  document.body.appendChild(m);
  requestAnimationFrame(() => m.classList.add("in"));
  const close = () => { m.classList.remove("in"); setTimeout(() => m.remove(), 200); };
  $(".modal-x", m).onclick = close;
  m.addEventListener("mousedown", e => { if (e.target === m) close(); });
  return { el: m, close };
}

/* ---------- авторы и цитирование ---------- */
const PATRO = /^(угли|ўғли|оглы|огли|o‘g‘li|o'g'li|ogli|кизи|қизи|qizi|кызы)$/i;
function splitAuthors(s) { return String(s || "").split(/;|\n/).map(x => x.trim()).filter(Boolean); }
function authorName(seg) { return seg.split(",")[0].trim(); }
function authorNames(s) { return splitAuthors(s).map(authorName).filter(Boolean); }
function shortName(full, apa) {
  const w = full.trim().split(/\s+/);
  if (w.length < 2) return full;
  const sur = w[0];
  const ini = w.slice(1).filter(x => !PATRO.test(x)).flatMap(x => /\./.test(x) ? x.split(".").filter(Boolean) : [x[0]]).slice(0, 2).map(c => c.toUpperCase() + ".");
  return apa ? `${sur}, ${ini.join(" ")}` : `${sur} ${ini.join("")}`;
}
function citeFormats(a) {
  const year = new Date(a.published_at || a.created_at || Date.now()).getFullYear();
  const link = siteUrl() + "article.html?id=" + a.id;
  const names = authorNames(a.authors);
  const today = new Date().toLocaleDateString("ru-RU");
  return {
    gost: `${names.map(n => shortName(n)).join(", ").replace(/\.?$/, ".")} ${a.title} // Lawart: электронный научный журнал. ${year}. № ${a.id}. URL: ${link} (дата обращения: ${today}).`,
    apa: `${names.map(n => shortName(n, true)).join(", ")} (${year}). ${a.title}. Lawart, ${a.id}. ${link}`,
    bib: `@article{lawart${year}_${a.id},\n  author  = {${names.join(" and ")}},\n  title   = {${a.title}},\n  journal = {Lawart},\n  year    = {${year}},\n  number  = {${a.id}},\n  url     = {${link}}\n}`
  };
}
async function copyText(txt, msg) {
  try { await navigator.clipboard.writeText(txt); toast(msg || t("c.copied")); }
  catch (e) {
    const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast(msg || t("c.copied")); } catch (e2) { toast(t("c.copyFail")); }
    ta.remove();
  }
}

/* ---------- поиск ---------- */
function tokens(q) { return norm(q).split(" ").filter(Boolean); }
function hay(a) {
  return a._h || (a._h = {
    T: norm(a.title), A: norm(a.authors), K: norm(a.keywords), B: norm(a.abstract),
    C: norm(a.category + " " + (RUBRIC_I18N[a.category] ? RUBRIC_I18N[a.category].uz[0] + " " + RUBRIC_I18N[a.category].en[0] : ""))
  });
}
function scoreArticle(a, toks) {
  if (!toks.length) return 1;
  const h = hay(a);
  let s = 0;
  for (const tk of toks) {
    let p = 0;
    if (h.T.includes(tk)) p += 6;
    if (h.A.includes(tk)) p += 5;
    if (h.K.includes(tk)) p += 4;
    if (h.C.includes(tk)) p += 3;
    if (h.B.includes(tk)) p += 1;
    if (!p) return 0;
    s += p;
  }
  if (toks.length > 1 && h.T.includes(toks.join(" "))) s += 10;
  if (h.T.startsWith(toks[0])) s += 2;
  return s;
}
function searchArticles(list, q) {
  const toks = tokens(q);
  if (!toks.length) return list.slice();
  return list.map(a => [a, scoreArticle(a, toks)]).filter(x => x[1] > 0).sort((x, y) => y[1] - x[1]).map(x => x[0]);
}
function highlight(text, toks) {
  text = String(text || "");
  if (!toks || !toks.length) return esc(text);
  const pat = toks.filter(Boolean).map(tk => tk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/е/g, "[е\u0451]").replace(/'/g, "['‘’ʻʼ`´]")).join("|");
  if (!pat) return esc(text);
  const re = new RegExp(pat, "gi");
  let out = "", last = 0, m;
  while ((m = re.exec(text))) {
    if (!m[0].length) { re.lastIndex++; continue; }
    out += esc(text.slice(last, m.index)) + "<mark>" + esc(m[0]) + "</mark>";
    last = m.index + m[0].length;
  }
  return out + esc(text.slice(last));
}

/* ---------- данные ---------- */
const ART_COLS = "id,title,authors,category,abstract,keywords,lang,published_at,views,downloads,pages,thumb_url,featured,pdf_path";
async function getIndex(force = false) {
  if (!force) {
    try { const c = JSON.parse(sessionStorage.getItem("lawart-idx") || "null"); if (c && Date.now() - c.t < 90000) return c.d; } catch (e) { }
  }
  const [a, n] = await Promise.all([
    sb.from("articles").select(ART_COLS).eq("status", "published").order("published_at", { ascending: false }),
    sb.from("news").select("id,kind,title,summary,cover_url,created_at,author").eq("published", true).order("created_at", { ascending: false })
  ]);
  let arts = a.data || [];
  if (a.error) {
    const r = await sb.from("articles").select("id,title,authors,category,abstract,keywords,lang,published_at,views,pdf_path").eq("status", "published").order("published_at", { ascending: false });
    arts = r.data || [];
  }
  let news = n.data || [];
  if (n.error) {
    const r = await sb.from("news").select("id,kind,title,summary,cover_url,created_at").eq("published", true).order("created_at", { ascending: false });
    news = r.data || [];
  }
  const d = { articles: arts, news };
  try { sessionStorage.setItem("lawart-idx", JSON.stringify({ t: Date.now(), d })); } catch (e) { }
  return d;
}
function dropIndex() { try { sessionStorage.removeItem("lawart-idx"); } catch (e) { } }

/* ---------- избранное, тема, язык ---------- */
const Fav = {
  list() { return store.get("lawart-fav", []); },
  has(id) { return this.list().includes(+id); },
  toggle(id) {
    id = +id; let l = this.list(); const on = !l.includes(id);
    l = on ? [id, ...l] : l.filter(x => x !== id);
    store.set("lawart-fav", l); paintFav(); return on;
  }
};
function paintFav() { const n = Fav.list().length; $$(".fav-count").forEach(e => { e.textContent = n; e.classList.toggle("hidden", !n); }); }
const Theme = {
  get() { return document.documentElement.dataset.theme === "dark" ? "dark" : "light"; },
  set(v) { document.documentElement.dataset.theme = v; try { localStorage.setItem("lawart-theme", v); } catch (e) { } $$(".theme-btn").forEach(b => b.innerHTML = v === "dark" ? ICON.sun : ICON.moon); },
  toggle() {
    const html = document.documentElement;
    html.classList.add("theme-anim");
    this.set(this.get() === "dark" ? "light" : "dark");
    setTimeout(() => html.classList.remove("theme-anim"), 500);
  }
};

/* ---------- сессия ---------- */
const ME = { user: null, profile: null };
async function loadMe() {
  const { data: { session } } = await sb.auth.getSession();
  ME.user = session?.user || null; ME.profile = null;
  if (ME.user) {
    const r = await sb.rpc("my_profile");
    if (!r.error && r.data) ME.profile = r.data;
    else {
      const f = await sb.from("profiles").select("id,full_name,degree,organization,position,orcid,is_admin,created_at").eq("id", ME.user.id).maybeSingle();
      ME.profile = f.data;
    }
  }
  return ME;
}
async function requireAuth() {
  await loadMe();
  if (!ME.user) { location.href = "auth.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search + location.hash); return false; }
  return true;
}

/* ---------- шапка ---------- */
const NAV = [["index.html", "nav.home", "home"], ["articles.html", "nav.articles", "articles"], ["index.html#rubrics", "nav.rubrics", "rubrics"], ["news.html", "nav.news", "news"], ["news.html?kind=interesting", "nav.interesting", "interesting"], ["authors.html", "nav.authors", "authors"]];
function langMenu() {
  return `<div class="lang-wrap"><button class="lang-btn" type="button" aria-label="${t("h.lang")}">${ICON.globe}<span>${LANG.toUpperCase()}</span></button>
    <div class="lang-pop hidden">${Object.entries(LANGS).map(([k, v]) => `<button type="button" data-lang="${k}" class="${k === LANG ? "on" : ""}"><b>${k.toUpperCase()}</b>${v}</button>`).join("")}</div></div>`;
}
function renderHeader(active, opts = {}) {
  const el = document.createElement("header");
  el.className = "top" + (opts.overlay ? " overlay" : "");
  el.innerHTML = `<div class="scroll-prog"><i></i></div><div class="wrap top-in">
    <a class="logo" href="index.html" aria-label="Lawart">${LOGO}<b>Law<i>art</i></b></a>
    <nav class="nav">${NAV.map(([h, k, id]) => `<a href="${h}" class="${id === active ? "on" : ""}">${t(k)}</a>`).join("")}</nav>
    <div class="top-actions">
      <button class="search-btn" type="button" aria-label="${t("h.search")}">${ICON.search}<span>${t("h.search")}</span><kbd>Ctrl K</kbd></button>
      ${langMenu()}
      <button class="icon-btn theme-btn" type="button" aria-label="${t("h.theme")}">${Theme.get() === "dark" ? ICON.sun : ICON.moon}</button>
      <a class="icon-btn fav-btn" href="articles.html?saved=1" aria-label="${t("h.saved")}">${ICON.star}<span class="fav-count hidden">0</span></a>
      <span id="userBox" class="user-box"></span>
      <button class="burger" type="button" aria-label="${t("h.menu")}"><span></span><span></span></button>
    </div>
  </div>`;
  document.body.prepend(el);
  const m = document.createElement("div");
  m.className = "mnav night";
  m.innerHTML = `<div class="mnav-in">${NAV.map(([h, k], i) => `<a href="${h}" style="--i:${i}"><small>0${i + 1}</small>${t(k)}</a>`).join("")}
    <div class="mnav-lang">${Object.keys(LANGS).map(k => `<button type="button" data-lang="${k}" class="${k === LANG ? "on" : ""}">${k.toUpperCase()}</button>`).join("")}</div>
    <div class="mnav-foot">${ME.user ? `<a class="btn gold" href="${ME.profile?.is_admin ? "admin.html" : "cabinet.html"}">${ME.profile?.is_admin ? t("h.editorial") : t("h.cabinet")}</a>` : `<a class="btn gold" href="auth.html">${t("h.login")}</a>`}
    <a class="btn ghost-light" href="cabinet.html#new">${t("h.publishArticle")}</a></div></div>`;
  document.body.appendChild(m);
  $(".burger", el).onclick = () => document.body.classList.toggle("menu-open");
  $$("a", m).forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));
  $(".theme-btn", el).onclick = () => Theme.toggle();
  $(".search-btn", el).onclick = () => Palette.open();
  $(".lang-btn", el).onclick = e => { e.stopPropagation(); $(".lang-pop", el).classList.toggle("hidden"); };
  $$("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));
  document.addEventListener("click", e => { if (!e.target.closest(".lang-wrap")) $(".lang-pop", el)?.classList.add("hidden"); });
  const bar = $(".scroll-prog i", el);
  const onScroll = () => {
    el.classList.toggle("scrolled", scrollY > 24);
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  paintUser(); paintFav();
}
function paintUser() {
  const box = $("#userBox"); if (!box) return;
  if (!ME.user) {
    box.innerHTML = `<a class="btn ghost sm hide-s" href="auth.html">${t("h.login")}</a><a class="btn red sm magnetic hide-s" href="auth.html?mode=signup&next=cabinet.html%23new">${t("h.publish")}</a>`;
    return;
  }
  const name = ME.profile?.full_name || ME.user.email;
  const home = ME.profile?.is_admin ? "admin.html" : "cabinet.html";
  box.innerHTML = `<div class="bell-wrap"><button class="icon-btn bell" id="bellBtn" type="button" aria-label="${t("notif.title")}">${ICON.bell}<span class="dot hidden" id="bellDot"></span></button><div class="bell-pop hidden" id="bellPop"></div></div>
    ${ME.profile?.is_admin ? "" : `<a class="btn red sm magnetic hide-s" href="cabinet.html#new">${t("h.publish")}</a>`}
    <a class="userchip" href="${home}" title="${esc(name)}"><span class="avatar">${esc(initials(name))}</span></a>`;
  $("#bellBtn").onclick = e => { e.stopPropagation(); $("#bellPop").classList.toggle("hidden"); };
  document.addEventListener("click", e => { if (!e.target.closest(".bell-wrap")) $("#bellPop")?.classList.add("hidden"); });
  pollBell(); setInterval(pollBell, 15000);
}
const NOTIF_MAP = [[/^Новая заявка/, "n.newSub"], [/^Автор прислал/, "n.resub"], [/^Ваша статья опубликована/, "n.published"], [/^Редакция просит/, "n.revision"], [/^Редакция отклонила/, "n.rejected"], [/^Автор ответил/, "n.authorReplied"], [/^Вопрос редакции/, "n.editorAsked"]];
function notifText(s) {
  if (LANG === "ru") return s;
  const m = String(s).match(/«(.*)»/);
  const hit = NOTIF_MAP.find(([re]) => re.test(s));
  return hit ? `${t(hit[1])}${m ? ": «" + m[1] + "»" : ""}` : s;
}
let lastUnread = -1;
async function pollBell() {
  if (!ME.user || !$("#bellPop")) return;
  const { data } = await sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(25);
  if (!data) return;
  const unread = data.filter(n => !n.is_read).length;
  const dot = $("#bellDot");
  dot.textContent = unread > 9 ? "9+" : unread;
  dot.classList.toggle("hidden", !unread);
  if (lastUnread >= 0 && unread > lastUnread) { toast(t("notif.new")); $("#bellBtn").classList.add("ring"); setTimeout(() => $("#bellBtn")?.classList.remove("ring"), 1200); }
  lastUnread = unread;
  document.title = document.title.replace(/^\(\d+\+?\) /, "");
  if (unread) document.title = `(${unread}) ` + document.title;
  $("#bellPop").innerHTML = `<h4>${t("notif.title")} ${unread ? `<button id="readAll" type="button">${t("notif.readAll")}</button>` : ""}</h4>` +
    (data.length ? data.map(n => `<a href="${esc(n.link || "#")}" data-id="${n.id}" class="${n.is_read ? "" : "new"}"><i class="k-${esc(n.kind)}"></i><span>${esc(notifText(n.text))}<small>${fmtTime(n.created_at)}</small></span></a>`).join("")
      : `<div class="empty">${t("notif.empty")}</div>`);
  $$("#bellPop a[data-id]").forEach(a => a.onclick = () => { sb.from("notifications").update({ is_read: true }).eq("id", a.dataset.id).then(() => { }); });
  const ra = $("#readAll");
  if (ra) ra.onclick = async e => { e.stopPropagation(); await sb.from("notifications").update({ is_read: true }).eq("is_read", false); pollBell(); };
}
async function readNotifFor(link) {
  if (!ME.user) return;
  await sb.from("notifications").update({ is_read: true }).eq("link", link).eq("is_read", false);
  pollBell();
}

/* ---------- подвал ---------- */
function renderFooter() {
  const f = document.createElement("footer");
  f.className = "foot night";
  f.innerHTML = `<div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="logo light" href="index.html">${LOGO}<b>Law<i>art</i></b></a>
        <p class="foot-about">${t("f.about")}</p>
        <a class="btn gold sm magnetic" href="cabinet.html#new">${t("f.submit")} ${ICON.arrow}</a>
      </div>
      <div><h5>${t("f.journal")}</h5><a href="articles.html">${t("f.all")}</a><a href="index.html#rubrics">${t("nav.rubrics")}</a><a href="news.html">${t("nav.news")}</a><a href="news.html?kind=interesting">${t("nav.interesting")}</a></div>
      <div><h5>${t("f.forAuthors")}</h5><a href="authors.html">${t("f.req")}</a><a href="auth.html?mode=signup">${t("f.register")}</a><a href="cabinet.html">${t("f.cabinet")}</a><a href="https://t.me/${esc(CFG.CONTACT_TELEGRAM)}" target="_blank" rel="noopener">${t("f.tg")}</a></div>
      <div><h5>${t("f.readers")}</h5><a href="articles.html?saved=1">${t("h.saved")}</a><a href="#" data-random>${t("p.random")}</a><a href="#" data-search>${t("f.searchAll")}</a>
        <div class="foot-lang">${Object.keys(LANGS).map(k => `<button type="button" data-lang="${k}" class="${k === LANG ? "on" : ""}">${k.toUpperCase()}</button>`).join("")}</div></div>
    </div>
    <div class="foot-big" aria-hidden="true"><span>Law</span><i>art</i></div>
    <div class="copy"><span>© ${new Date().getFullYear()} Lawart.uz · ${t("f.city")}</span><span>${t("f.tagline")}</span></div>
  </div>`;
  document.body.appendChild(f);
  $("[data-random]", f).onclick = e => { e.preventDefault(); goRandom(); };
  $("[data-search]", f).onclick = e => { e.preventDefault(); Palette.open(); };
  $$("[data-lang]", f).forEach(b => b.onclick = () => setLang(b.dataset.lang));
}
async function goRandom() {
  const { articles } = await getIndex();
  if (!articles.length) { toast(t("b.soon")); return; }
  const a = articles[Math.floor(Math.random() * articles.length)];
  location.href = "article.html?id=" + a.id;
}

/* ---------- палитра поиска (Ctrl+K) ---------- */
const Palette = {
  el: null, sel: 0, data: null,
  build() {
    if (this.el) return;
    const el = document.createElement("div");
    el.className = "pal-bg";
    el.innerHTML = `<div class="pal" role="dialog" aria-label="${t("p.aria")}">
      <div class="pal-in">${ICON.search}<input id="palQ" placeholder="${esc(t("p.placeholder"))}" autocomplete="off"><kbd>Esc</kbd></div>
      <div class="pal-res" id="palRes"></div>
      <div class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> ${t("p.select")}</span><span><kbd>Enter</kbd> ${t("p.open")}</span><span><kbd>Esc</kbd> ${t("p.close")}</span></div>
    </div>`;
    document.body.appendChild(el);
    this.el = el;
    el.addEventListener("mousedown", e => { if (e.target === el) this.close(); });
    $("#palQ").addEventListener("input", debounce(() => this.render(), 60));
    $("#palQ").addEventListener("keydown", e => {
      const items = $$(".pal-item", el);
      if (e.key === "ArrowDown") { e.preventDefault(); this.sel = Math.min(items.length - 1, this.sel + 1); this.mark(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); this.sel = Math.max(0, this.sel - 1); this.mark(); }
      else if (e.key === "Enter") {
        e.preventDefault();
        const it = items[this.sel];
        if (it) it.click();
        else if (e.target.value.trim()) location.href = "articles.html?q=" + encodeURIComponent(e.target.value.trim());
      }
    });
  },
  async open(q = "") {
    this.build();
    document.body.classList.add("pal-open");
    this.el.classList.add("in");
    const i = $("#palQ"); i.value = q; setTimeout(() => i.focus(), 30);
    if (!this.data) { $("#palRes").innerHTML = `<div class="pal-empty">${t("c.loading")}</div>`; this.data = await getIndex(); }
    this.render();
  },
  close() { if (!this.el) return; this.el.classList.remove("in"); document.body.classList.remove("pal-open"); },
  mark() {
    const items = $$(".pal-item", this.el);
    items.forEach((x, i) => x.classList.toggle("on", i === this.sel));
    items[this.sel]?.scrollIntoView({ block: "nearest" });
  },
  render() {
    const q = $("#palQ").value, toks = tokens(q), d = this.data || { articles: [], news: [] };
    let html = "";
    if (!toks.length) {
      const pop = d.articles.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
      if (pop.length) html += `<div class="pal-g">${t("p.popular")}</div>` + pop.map(a => this.artItem(a, [])).join("");
      html += `<div class="pal-g">${t("p.quick")}</div>
        <a class="pal-item" href="articles.html"><span class="pi-ic">${ICON.arrow}</span><span><b>${t("p.allArticles")}</b><small>${t("p.allArticlesSub")}</small></span></a>
        <a class="pal-item" href="#" data-act="random"><span class="pi-ic">${ICON.dice}</span><span><b>${t("p.random")}</b><small>${t("p.randomSub")}</small></span></a>
        <a class="pal-item" href="cabinet.html#new"><span class="pi-ic">${ICON.down}</span><span><b>${t("p.submit")}</b><small>${t("p.submitSub")}</small></span></a>`;
      html += `<div class="pal-g">${t("p.rubrics")}</div><div class="pal-chips">${RUBRIC_NAMES.map(r => `<a class="chip" href="articles.html?rubric=${encodeURIComponent(r)}">${esc(rubricName(r))}</a>`).join("")}</div>`;
    } else {
      const arts = searchArticles(d.articles, q).slice(0, 7);
      const names = [...new Set(d.articles.flatMap(a => authorNames(a.authors)))].filter(n => toks.every(tk => norm(n).includes(tk))).slice(0, 4);
      const rubs = RUBRIC_NAMES.filter(r => toks.every(tk => norm(r + " " + rubricName(r)).includes(tk))).slice(0, 4);
      const news = d.news.filter(n => toks.every(tk => norm(n.title + " " + n.summary).includes(tk))).slice(0, 3);
      if (arts.length) html += `<div class="pal-g">${t("p.articles")}</div>` + arts.map(a => this.artItem(a, toks)).join("");
      if (names.length) html += `<div class="pal-g">${t("p.authors")}</div>` + names.map(n => `<a class="pal-item" href="articles.html?author=${encodeURIComponent(n)}"><span class="pi-av">${esc(initials(n))}</span><span><b>${highlight(n, toks)}</b><small>${t("p.authorAll")}</small></span></a>`).join("");
      if (rubs.length) html += `<div class="pal-g">${t("p.rubrics")}</div>` + rubs.map(r => `<a class="pal-item" href="articles.html?rubric=${encodeURIComponent(r)}"><span class="pi-ic">§</span><span><b>${highlight(rubricName(r), toks)}</b><small>${t("p.openRubric")}</small></span></a>`).join("");
      if (news.length) html += `<div class="pal-g">${t("p.news")}</div>` + news.map(n => `<a class="pal-item" href="news-item.html?id=${n.id}"><span class="pi-ic">✦</span><span><b>${highlight(n.title, toks)}</b><small>${fmtShort(n.created_at)}</small></span></a>`).join("");
      if (!html) html = `<div class="pal-empty">${esc(t("p.nothing", { q }))}</div>`;
      else html += `<a class="pal-item pal-all" href="articles.html?q=${encodeURIComponent(q)}"><span class="pi-ic">${ICON.search}</span><span><b>${t("p.showAll")}</b><small>${t("p.inCatalog")}</small></span></a>`;
    }
    $("#palRes").innerHTML = html;
    this.sel = 0; this.mark();
    $$("[data-act=random]", this.el).forEach(x => x.onclick = e => { e.preventDefault(); goRandom(); });
    $$(".pal-item", this.el).forEach((x, i) => x.addEventListener("mousemove", () => { if (this.sel !== i) { this.sel = i; this.mark(); } }));
  },
  artItem(a, toks) {
    return `<a class="pal-item" href="article.html?id=${a.id}"><span class="pi-num">№${pad(a.id)}</span><span><b>${highlight(a.title, toks)}</b><small>${highlight(authorNames(a.authors).join(", "), toks)} · ${esc(rubricName(a.category))}</small></span></a>`;
  }
};
document.addEventListener("keydown", e => {
  const tag = document.activeElement?.tagName || "";
  const typing = /input|textarea|select/i.test(tag) || document.activeElement?.isContentEditable;
  if ((e.ctrlKey || e.metaKey) && (e.code === "KeyK" || e.key === "k" || e.key === "K" || e.key === "л" || e.key === "Л")) { e.preventDefault(); Palette.open(); }
  else if (e.key === "/" && !typing) { e.preventDefault(); Palette.open(); }
  else if (e.key === "Escape") { Palette.close(); document.body.classList.remove("menu-open"); }
});

/* ---------- книжка в углу ---------- */
function initBook() {
  if (store.get("lawart-book-off", false)) return;
  const w = document.createElement("div");
  w.className = "book-w";
  w.innerHTML = `<button class="book-x" type="button" aria-label="${t("b.hide")}">×</button>
    <a class="book" href="#" aria-label="${t("b.tip")}">
      <span class="bk"><span class="bk-cov"></span><span class="bk-l"></span><span class="bk-r"></span>
      ${[0, 1, 2, 3, 4].map(i => `<span class="bk-p" style="--i:${i}"></span>`).join("")}<span class="bk-glow"></span></span>
      <span class="bk-shadow"></span>
    </a>
    <span class="book-tip">${t("b.tip")}</span>`;
  document.body.appendChild(w);
  $(".book", w).onclick = e => { e.preventDefault(); w.classList.add("go"); const r = $(".book", w).getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + 10, 50); setTimeout(goRandom, 450); };
  $(".book-x", w).onclick = () => { store.set("lawart-book-off", true); w.remove(); };
  const onS = () => w.classList.toggle("show", scrollY > 280);
  addEventListener("scroll", onS, { passive: true }); onS();
}

/* ---------- заставка ---------- */
function intro() {
  let seen = false;
  try { seen = sessionStorage.getItem("lawart-intro") === "1"; sessionStorage.setItem("lawart-intro", "1"); } catch (e) { }
  if (seen || reduced) return;
  const d = document.createElement("div");
  d.className = "intro";
  d.innerHTML = `<div class="intro-in"><span class="intro-w">${"Law".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}<i>${"art".split("").map((c, i) => `<span style="--i:${i + 3}">${c}</span>`).join("")}</i></span><span class="intro-line"></span><span class="intro-sub">${t("i.sub")}</span></div>`;
  document.body.appendChild(d);
  setTimeout(() => d.classList.add("out"), 1300);
  setTimeout(() => d.remove(), 2200);
}

/* ---------- эффекты ---------- */
let revealIO;
function reveal(root = document) {
  if (reduced || !("IntersectionObserver" in window)) { $$(".reveal", root).forEach(e => e.classList.add("in")); return; }
  revealIO = revealIO || new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
  }), { threshold: .06, rootMargin: "0px 0px -30px 0px" });
  $$(".reveal:not(.in)", root).forEach((el, i) => { if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i % 6) * 70 + "ms"); revealIO.observe(el); });
}
function bindFx(root = document) {
  reveal(root);
  if (!finePointer || reduced) return;
  $$(".tilt:not([data-fx])", root).forEach(el => {
    el.dataset.fx = 1;
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", ((.5 - y) * 7).toFixed(2) + "deg");
      el.style.setProperty("--ry", ((x - .5) * 9).toFixed(2) + "deg");
      el.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
      el.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
    });
    el.addEventListener("mouseleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });
  $$(".magnetic:not([data-fx])", root).forEach(el => {
    el.dataset.fx = 1;
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 10}px, ${((e.clientY - r.top) / r.height - .5) * 8}px)`;
    });
    el.addEventListener("mouseleave", () => el.style.transform = "");
  });
  $$(".spot:not([data-fx])", root).forEach(el => {
    el.dataset.fx = 1;
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
}
function countUp(el, v, ms = 1600) {
  v = +v || 0;
  if (reduced || !v) { el.textContent = num(v); return; }
  const t0 = performance.now();
  const step = tm => { const p = Math.min(1, (tm - t0) / ms), e = 1 - Math.pow(1 - p, 3); el.textContent = num(Math.round(v * e)); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function cursor() {
  if (!finePointer || reduced) return;
  const ring = document.createElement("div"); ring.className = "cur-ring";
  const dot = document.createElement("div"); dot.className = "cur-dot";
  document.body.append(ring, dot);
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, shown = false;
  addEventListener("pointermove", e => {
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; document.body.classList.add("has-cursor"); }
    const hot = e.target.closest("a, button, input, textarea, select, label, .tilt, [role=button]");
    ring.classList.toggle("hot", !!hot);
    ring.classList.toggle("text", !!e.target.closest("input, textarea"));
  }, { passive: true });
  addEventListener("pointerdown", () => ring.classList.add("press"));
  addEventListener("pointerup", () => ring.classList.remove("press"));
  document.addEventListener("mouseleave", () => { document.body.classList.remove("has-cursor"); shown = false; });
  (function loop() {
    rx += (x - rx) * .18; ry += (y - ry) * .18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(loop);
  })();
}
function toTop() {
  const b = document.createElement("button");
  b.className = "totop"; b.type = "button"; b.setAttribute("aria-label", t("c.top"));
  b.innerHTML = `<svg class="ring" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21"/><circle class="pr" cx="24" cy="24" r="21"/></svg>${ICON.up}`;
  document.body.appendChild(b);
  const pr = $(".pr", b), L = 2 * Math.PI * 21;
  pr.style.strokeDasharray = L;
  const on = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    b.classList.toggle("show", scrollY > 700);
    pr.style.strokeDashoffset = L * (1 - (h > 0 ? scrollY / h : 0));
  };
  addEventListener("scroll", on, { passive: true }); on();
  b.onclick = () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}
function confetti(x, y, n = 120) {
  if (reduced) return;
  const c = document.createElement("canvas");
  c.className = "confetti"; c.width = innerWidth; c.height = innerHeight;
  document.body.appendChild(c);
  const g = c.getContext("2d");
  const cols = ["#e6c98c", "#c9a35c", "#f4ead2", "#b8323f", "#a7813f"];
  const ps = Array.from({ length: n }, () => ({ x, y, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4, r: Math.random() * 6 + 3, a: Math.random() * 6, va: (Math.random() - .5) * .35, c: cols[Math.floor(Math.random() * cols.length)], s: Math.random() < .5 }));
  const t0 = performance.now();
  (function f(tm) {
    const p = (tm - t0) / 1800;
    g.clearRect(0, 0, c.width, c.height);
    for (const q of ps) {
      q.x += q.vx; q.y += q.vy; q.vy += .38; q.vx *= .985; q.a += q.va;
      g.save(); g.globalAlpha = Math.max(0, 1 - p); g.translate(q.x, q.y); g.rotate(q.a); g.fillStyle = q.c;
      if (q.s) g.fillRect(-q.r / 2, -q.r / 4, q.r, q.r / 2); else { g.beginPath(); g.arc(0, 0, q.r / 2.4, 0, 7); g.fill(); }
      g.restore();
    }
    if (p < 1) requestAnimationFrame(f); else c.remove();
  })(t0);
}
function pageTransitions() {
  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a"); if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || a.hasAttribute("download")) return;
    let url; try { url = new URL(a.href, location.href); } catch (er) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => { location.href = a.href; }, reduced ? 0 : 170);
  });
  addEventListener("pageshow", ev => { if (ev.persisted) document.body.classList.remove("leaving"); });
}

async function boot(active, opts = {}) {
  intro();
  applyI18n();
  requestAnimationFrame(() => document.body.classList.add("ready"));
  await loadMe();
  renderHeader(active, opts);
  if (!opts.noFooter) renderFooter();
  if (!opts.noBook) initBook();
  pageTransitions();
  // курсор: обычный системный
  toTop();
  sb.auth.onAuthStateChange(ev => { if (ev === "SIGNED_OUT") location.href = "index.html"; });
}

/* ---------- карточки статей ---------- */
function coverHTML(a, big) {
  if (a.thumb_url) return `<span class="cover has-img${big ? " big" : ""}"><img src="${esc(a.thumb_url)}" alt="" loading="lazy"><span class="cv-shine"></span></span>`;
  return `<span class="cover gen${big ? " big" : ""}"><span class="cv-top"><b>Lawart</b><span>№${pad(a.id)}</span></span><span class="cv-rule"></span><span class="cv-cat">${esc(rubricName(a.category))}</span><span class="cv-title">${esc(a.title)}</span><span class="cv-auth">${esc(authorNames(a.authors).map(n => shortName(n)).join(", "))}</span><span class="cv-seal">§</span><span class="cv-shine"></span></span>`;
}
function metaHTML(a) {
  const rm = readMin(a);
  return `<span>${fmtShort(a.published_at)}</span>${rm ? `<span>${ICON.clock}${rm} ${t("m.min")}</span>` : ""}<span>${ICON.eye}${num(a.views)}</span>${a.downloads ? `<span>${ICON.down}${num(a.downloads)}</span>` : ""}`;
}
function cardHTML(a, toks = []) {
  return `<a class="acard tilt reveal" href="article.html?id=${a.id}">
    <span class="ac-top"><span class="ac-num">№${pad(a.id)}</span><span class="ac-cat">${esc(rubricName(a.category))}</span></span>
    <span class="ac-title">${highlight(a.title, toks)}</span>
    <span class="ac-auth">${highlight(authorNames(a.authors).join(", "), toks)}</span>
    <span class="ac-abs">${esc(String(a.abstract || "").slice(0, 220))}${String(a.abstract || "").length > 220 ? "…" : ""}</span>
    <span class="ac-meta">${metaHTML(a)}</span>
    <span class="glare"></span>
  </a>`;
}

/* ---------- PDF: страницы и превью ---------- */
const PDFJS_V = "4.4.168";
let _pdfjs;
async function pdfjs() {
  if (_pdfjs) return _pdfjs;
  const base = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_V}/build/`;
  const lib = await import(base + "pdf.min.mjs");
  try {
    const blob = new Blob([`import "${base}pdf.worker.min.mjs";`], { type: "text/javascript" });
    lib.GlobalWorkerOptions.workerPort = new Worker(URL.createObjectURL(blob), { type: "module" });
  } catch (e) { lib.GlobalWorkerOptions.workerSrc = base + "pdf.worker.min.mjs"; }
  return (_pdfjs = lib);
}
async function pdfInfo(src, wantThumb) {
  const work = (async () => {
    const lib = await pdfjs();
    const params = src instanceof Blob ? { data: new Uint8Array(await src.arrayBuffer()) } : { url: src };
    const doc = await lib.getDocument(params).promise;
    let thumb = null;
    if (wantThumb) {
      const p = await doc.getPage(1);
      const v1 = p.getViewport({ scale: 1 }), vp = p.getViewport({ scale: 560 / v1.width });
      const c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      await p.render({ canvasContext: ctx, viewport: vp }).promise;
      thumb = await new Promise(r => c.toBlob(r, "image/jpeg", .82));
    }
    return { pages: doc.numPages, thumb };
  })();
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("pdf timeout")), 25000));
  return Promise.race([work, timeout]);
}
async function makeThumb(a) {
  try {
    const url = await signedUrl("papers", a.pdf_path, 600);
    if (!url) return null;
    const info = await pdfInfo(url, true);
    if (!info.thumb) return { pages: info.pages };
    const path = `thumbs/${a.id}-${Date.now()}.jpg`;
    const { error } = await sb.storage.from("covers").upload(path, info.thumb, { contentType: "image/jpeg", upsert: true });
    if (error) return { pages: info.pages };
    return { pages: info.pages, thumb_url: sb.storage.from("covers").getPublicUrl(path).data.publicUrl };
  } catch (e) { console.warn("thumb", e); return null; }
}

/* ---------- файлы ---------- */
async function signedUrl(bucket, path, sec = 3600) {
  if (!path) return null;
  const { data } = await sb.storage.from(bucket).createSignedUrl(path, sec);
  return data?.signedUrl || null;
}
function safeName(n) {
  const ext = (String(n).split(".").pop() || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  return Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
}
async function uploadPaper(file, ownerId) {
  if (!file) throw new Error(t("cb.needPdf"));
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) throw new Error(t("cb.needPdf"));
  if (file.size > 20 * 1024 * 1024) throw new Error(t("ch.big"));
  const path = `${ownerId}/${safeName(file.name)}`;
  const { error } = await sb.storage.from("papers").upload(path, file, { contentType: "application/pdf" });
  if (error) throw error;
  return path;
}
const fileSize = b => b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";

/* ---------- чат по статье ---------- */
function mountChat(box, article, opts = {}) {
  const isAuthor = article.author_id === ME.user.id;
  const peer = opts.peer || (isAuthor ? t("ch.editorial") : t("ch.author"));
  box.innerHTML = `<div class="chat">
    <div class="chat-head"><span class="avatar sm">${esc(initials(peer))}</span><span class="ch-who"><b>${esc(peer)}</b><small>${isAuthor ? t("ch.aboutYour") : t("ch.thread", { n: pad(article.id) })}</small></span><span class="live"><i></i>${t("ch.live")}</span></div>
    <div class="chat-body" id="chatBody"><div class="chat-empty">${t("c.loading")}</div></div>
    <form class="chat-form" id="chatForm">
      <input type="file" id="chatFile" class="hidden">
      <button type="button" class="attach" title="${t("ch.attach")}" aria-label="${t("ch.attach")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/></svg></button>
      <div class="chat-input"><div class="att hidden" id="chatAtt"></div><textarea id="chatText" rows="1" placeholder="${esc(isAuthor ? t("ch.phAuthor") : t("ch.phAdmin"))}"></textarea></div>
      <button class="btn red send" aria-label="${t("ch.send")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg></button>
    </form>
  </div>`;
  const body = $("#chatBody", box), ta = $("#chatText", box), fileIn = $("#chatFile", box), att = $("#chatAtt", box);
  let lastSig = "", timer;
  const urls = {};
  const grow = () => { ta.style.height = "auto"; ta.style.height = Math.min(160, ta.scrollHeight) + "px"; };
  ta.addEventListener("input", grow);
  $(".attach", box).onclick = () => fileIn.click();
  fileIn.onchange = () => {
    const f = fileIn.files[0];
    att.classList.toggle("hidden", !f);
    att.innerHTML = f ? `📎 ${esc(f.name)} · ${fileSize(f.size)} <button type="button" aria-label="${t("ch.removeFile")}">×</button>` : "";
    if (f) $("button", att).onclick = () => { fileIn.value = ""; fileIn.onchange(); };
  };
  async function load() {
    const { data, error } = await sb.from("messages").select("*").eq("article_id", article.id).order("created_at");
    if (error) return;
    const sig = data.map(m => m.id + ":" + (m.read_at ? 1 : 0)).join(",");
    if (sig === lastSig) return;
    lastSig = sig;
    if (!data.length) {
      body.innerHTML = `<div class="chat-empty"><span>${ICON.chat}</span>${isAuthor ? t("ch.emptyAuthor") : t("ch.emptyAdmin")}</div>`;
      return;
    }
    for (const m of data) if (m.file_path && !urls[m.file_path]) urls[m.file_path] = await signedUrl("chat", m.file_path, 3600 * 6);
    let day = "", html = "";
    for (const m of data) {
      const d = LANG === "uz" ? uzDate(m.created_at).replace(/ \d{4}$/, "") : new Date(m.created_at).toLocaleDateString(LOCALE, { day: "numeric", month: "long" });
      if (d !== day) { html += `<div class="chat-day"><span>${d}</span></div>`; day = d; }
      const mine = m.sender_id === ME.user.id;
      html += `<div class="msg ${mine ? "mine" : ""}">${m.body ? esc(m.body) : ""}${m.file_path ? `<a class="msg-file" href="${urls[m.file_path]}" target="_blank" rel="noopener">📄 ${esc(m.file_name || t("ch.file"))}</a>` : ""}<small>${mine ? t("ch.you") : (isAuthor ? t("ch.editor") : t("ch.author"))} · ${hm(m.created_at)}${mine ? " · " + (m.read_at ? t("ch.read") : t("ch.delivered")) : ""}</small></div>`;
    }
    const atBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 80;
    body.innerHTML = html;
    if (atBottom || !body.dataset.init) { body.scrollTop = body.scrollHeight; body.dataset.init = 1; }
    const unread = data.filter(m => m.sender_id !== ME.user.id && !m.read_at).map(m => m.id);
    if (unread.length) await sb.from("messages").update({ read_at: new Date().toISOString() }).in("id", unread);
  }
  $("#chatForm", box).onsubmit = async e => {
    e.preventDefault();
    const text = ta.value.trim(), file = fileIn.files[0];
    if (!text && !file) return;
    const btn = $(".send", box); btn.disabled = true;
    try {
      let file_path = null, file_name = null;
      if (file) {
        if (file.size > 20 * 1024 * 1024) throw new Error(t("ch.big"));
        file_path = `${article.id}/${safeName(file.name)}`; file_name = file.name;
        const { error } = await sb.storage.from("chat").upload(file_path, file);
        if (error) throw error;
      }
      const { error } = await sb.from("messages").insert({ article_id: article.id, sender_id: ME.user.id, body: text, file_path, file_name });
      if (error) throw error;
      ta.value = ""; grow(); fileIn.value = ""; fileIn.onchange();
      await load(); body.scrollTop = body.scrollHeight;
      if (opts.onSend) opts.onSend();
    } catch (err) { toast(t("ch.fail") + ": " + err.message); }
    btn.disabled = false;
  };
  ta.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#chatForm", box).requestSubmit(); } });
  load();
  timer = setInterval(load, 4000);
  if (opts.focus) setTimeout(() => { ta.focus({ preventScroll: true }); box.scrollIntoView({ behavior: "smooth", block: "center" }); }, 350);
  return () => clearInterval(timer);
}
