/* Lawart.uz — общий модуль */
const CFG = window.LAWART_CONFIG;
const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);

const RUBRICS = [
  "Теория государства и права",
  "Конституционное право",
  "Гражданское право",
  "Предпринимательское право",
  "Трудовое право",
  "Семейное право",
  "Уголовное право и криминология",
  "Уголовный процесс",
  "Административное право",
  "Международное право",
  "Спортивное право",
  "Цифровое право и LegalTech",
  "Противодействие коррупции",
  "Судебная практика"
];
const STATUS = {
  pending: ["На проверке", "b-pending"],
  revision: ["Нужны правки", "b-revision"],
  published: ["Опубликована", "b-published"],
  rejected: ["Отклонена", "b-rejected"]
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = d => d ? new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "";
const fmtTime = d => new Date(d).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const initials = n => (n || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const badge = s => `<span class="badge ${STATUS[s]?.[1] || ""}">${STATUS[s]?.[0] || s}</span>`;
const qs = k => new URLSearchParams(location.search).get(k);

function toast(text, ms = 2600) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#16171d"/><circle cx="20" cy="20" r="15.5" fill="none" stroke="#b08d57" stroke-width=".8"/><path d="M14 11h4.2v15.2h8.3V30H14z" fill="#f4efe4"/><circle cx="27.5" cy="13.5" r="2.3" fill="#8b1e2d"/></svg>`;

/* ===== Сессия ===== */
const ME = { user: null, profile: null };
async function loadMe() {
  const { data: { session } } = await sb.auth.getSession();
  ME.user = session?.user || null;
  if (ME.user) {
    const { data } = await sb.from("profiles").select("*").eq("id", ME.user.id).maybeSingle();
    ME.profile = data;
  }
  return ME;
}
async function requireAuth() {
  await loadMe();
  if (!ME.user) { location.href = "auth.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search + location.hash); return false; }
  return true;
}

/* ===== Шапка и подвал ===== */
function renderHeader(active) {
  const nav = [
    ["index.html", "Главная", "home"],
    ["articles.html", "Научные статьи", "articles"],
    ["news.html", "Новости", "news"],
    ["news.html?kind=interesting", "Интересное", "interesting"],
    ["authors.html", "Авторам", "authors"]
  ].map(([h, t, k]) => `<a href="${h}" class="${k === active ? "on" : ""}">${t}</a>`).join("");
  const el = document.createElement("header");
  el.className = "top";
  el.innerHTML = `<div class="wrap">
    <a class="logo" href="index.html">${LOGO}<b>Law<i>art</i></b></a>
    <nav class="nav" id="nav">${nav}</nav>
    <div class="top-actions" id="topActions"></div>
    <button class="burger" aria-label="Меню" onclick="document.getElementById('nav').classList.toggle('open')"><span></span><span></span><span></span></button>
  </div>`;
  document.body.prepend(el);
  paintActions();
}

function paintActions() {
  const box = $("#topActions");
  if (!box) return;
  if (!ME.user) {
    box.innerHTML = `<a class="btn ghost sm" href="auth.html">Войти</a>
      <a class="btn red sm" href="auth.html?mode=signup&next=cabinet.html%23new">Опубликовать статью</a>`;
    return;
  }
  const name = ME.profile?.full_name || ME.user.email;
  const home = ME.profile?.is_admin ? "admin.html" : "cabinet.html";
  box.innerHTML = `
    <div style="position:relative">
      <button class="bell" id="bellBtn" aria-label="Уведомления">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        <span class="dot hidden" id="bellDot"></span>
      </button>
      <div class="bell-pop hidden" id="bellPop"></div>
    </div>
    ${ME.profile?.is_admin ? "" : `<a class="btn red sm" href="cabinet.html#new">Опубликовать статью</a>`}
    <a class="userchip" href="${home}" title="${esc(name)}"><span class="avatar">${esc(initials(name))}</span></a>`;
  $("#bellBtn").onclick = e => { e.stopPropagation(); $("#bellPop").classList.toggle("hidden"); };
  document.addEventListener("click", e => { if (!e.target.closest("#bellPop")) $("#bellPop")?.classList.add("hidden"); });
  pollBell();
  setInterval(pollBell, 15000);
}

let lastUnread = -1;
async function pollBell() {
  if (!ME.user) return;
  const { data } = await sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(25);
  if (!data) return;
  const unread = data.filter(n => !n.is_read).length;
  const dot = $("#bellDot");
  dot.textContent = unread > 9 ? "9+" : unread;
  dot.classList.toggle("hidden", !unread);
  if (lastUnread >= 0 && unread > lastUnread) toast("Новое уведомление");
  lastUnread = unread;
  document.title = document.title.replace(/^\(\d+\+?\) /, "");
  if (unread) document.title = `(${unread}) ` + document.title;
  $("#bellPop").innerHTML = `<h4>Уведомления ${unread ? `<button id="readAll">Прочитать все</button>` : ""}</h4>` +
    (data.length ? data.map(n => `<a href="${esc(n.link || "#")}" data-id="${n.id}" class="${n.is_read ? "" : "new"}">${esc(n.text)}<small>${fmtTime(n.created_at)}</small></a>`).join("")
      : `<div class="empty">Пока ничего нет</div>`);
  $$("#bellPop a[data-id]").forEach(a => a.onclick = async () => { await sb.from("notifications").update({ is_read: true }).eq("id", a.dataset.id); });
  const ra = $("#readAll");
  if (ra) ra.onclick = async e => { e.stopPropagation(); await sb.from("notifications").update({ is_read: true }).eq("is_read", false); pollBell(); };
}

function renderFooter() {
  const f = document.createElement("footer");
  f.innerHTML = `<div class="wrap foot-main">
    <div class="foot-grid">
      <div>
        <a class="logo" href="index.html">${LOGO}<b>Law<i>art</i></b></a>
        <p class="muted" style="max-width:380px;margin-top:14px">Электронный научный журнал юридических статей. Публикуем исследования студентов, магистрантов, преподавателей и практикующих юристов Узбекистана и других стран.</p>
      </div>
      <div><h5>Журнал</h5>
        <a href="articles.html">Научные статьи</a><a href="news.html">Новости</a><a href="news.html?kind=interesting">Интересное</a><a href="authors.html">Требования к статьям</a></div>
      <div><h5>Авторам</h5>
        <a href="auth.html?mode=signup">Регистрация</a><a href="cabinet.html#new">Подать статью</a>
        <a href="https://t.me/${CFG.CONTACT_TELEGRAM}" target="_blank" rel="noopener">Редакция в Telegram</a></div>
    </div>
    <div class="foot-big">Law<i>art</i></div>
    <div class="copy"><span>© ${new Date().getFullYear()} Lawart.uz</span><span>Ташкент, Узбекистан</span></div>
  </div>`;
  document.body.appendChild(f);
}

function reveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
  $$(".reveal").forEach(el => io.observe(el));
}

async function boot(active) {
  await loadMe();
  renderHeader(active);
  renderFooter();
  sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") location.href = "index.html"; });
}

/* ===== Файлы ===== */
async function signedUrl(bucket, path, sec = 3600) {
  if (!path) return null;
  const { data } = await sb.storage.from(bucket).createSignedUrl(path, sec);
  return data?.signedUrl || null;
}
function safeName(n) {
  const ext = (n.split(".").pop() || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "");
  return Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
}
async function uploadPaper(file, ownerId) {
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) throw new Error("Нужен файл PDF");
  if (file.size > 20 * 1024 * 1024) throw new Error("Файл больше 20 МБ");
  const path = `${ownerId}/${safeName(file.name)}`;
  const { error } = await sb.storage.from("papers").upload(path, file, { contentType: "application/pdf" });
  if (error) throw error;
  return path;
}

/* ===== Карточки статей ===== */
function articleCard(a, feature = false) {
  return `<a class="acard reveal ${feature ? "feature" : ""}" href="article.html?id=${a.id}">
    <span class="mono cat">${esc(a.category || "Статья")}</span>
    <h3>${esc(a.title)}</h3>
    ${feature && a.abstract ? `<div class="abs">${esc(a.abstract.slice(0, 260))}${a.abstract.length > 260 ? "…" : ""}</div>` : ""}
    <div class="auth">${esc(a.authors)}</div>
    <div class="foot mono"><span>${fmtDate(a.published_at)}</span><span>${a.views || 0} просм.</span></div>
  </a>`;
}

/* ===== Чат по статье ===== */
function mountChat(box, article, opts = {}) {
  const isAuthor = article.author_id === ME.user.id;
  box.innerHTML = `<div class="chat">
    <div class="chat-head"><span>${isAuthor ? "Переписка с редакцией" : "Переписка с автором"}</span><span class="mono muted">обновляется сама</span></div>
    <div class="chat-body" id="chatBody"><div class="chat-empty">Загрузка…</div></div>
    <form class="chat-form" id="chatForm">
      <input type="file" id="chatFile" class="hidden">
      <button type="button" class="attach" title="Прикрепить файл" onclick="document.getElementById('chatFile').click()">📎</button>
      <textarea id="chatText" placeholder="${isAuthor ? "Ответ редакции…" : "Вопрос автору по статье…"}" rows="1"></textarea>
      <button class="btn red">Отправить</button>
    </form>
  </div>`;
  const body = $("#chatBody", box);
  let lastId = 0, timer;
  const urlCache = {};

  async function load() {
    const { data, error } = await sb.from("messages").select("*").eq("article_id", article.id).order("created_at");
    if (error) return;
    if (!data.length) { body.innerHTML = `<div class="chat-empty">${isAuthor ? "Сообщений пока нет. Если у редакции появятся вопросы по статье, они придут сюда, а вы получите уведомление." : "Напишите автору, у него появится уведомление."}</div>`; return; }
    const newest = data[data.length - 1].id;
    if (newest === lastId) return;
    lastId = newest;
    for (const m of data) if (m.file_path && !urlCache[m.file_path]) urlCache[m.file_path] = await signedUrl("chat", m.file_path, 3600 * 6);
    body.innerHTML = data.map(m => `<div class="msg ${m.sender_id === ME.user.id ? "mine" : ""}">${esc(m.body)}${m.file_path ? `${m.body ? "<br>" : ""}📄 <a href="${urlCache[m.file_path]}" target="_blank" rel="noopener">${esc(m.file_name || "файл")}</a>` : ""}<small>${m.sender_id === ME.user.id ? "Вы" : (isAuthor ? "Редакция" : "Автор")} · ${fmtTime(m.created_at)}</small></div>`).join("");
    body.scrollTop = body.scrollHeight;
    const unread = data.filter(m => m.sender_id !== ME.user.id && !m.read_at).map(m => m.id);
    if (unread.length) await sb.from("messages").update({ read_at: new Date().toISOString() }).in("id", unread);
  }

  $("#chatForm", box).onsubmit = async e => {
    e.preventDefault();
    const text = $("#chatText", box).value.trim();
    const file = $("#chatFile", box).files[0];
    if (!text && !file) return;
    const btn = e.submitter; btn.disabled = true;
    try {
      let file_path = null, file_name = null;
      if (file) {
        if (file.size > 20 * 1024 * 1024) throw new Error("Файл больше 20 МБ");
        file_path = `${article.id}/${safeName(file.name)}`; file_name = file.name;
        const { error } = await sb.storage.from("chat").upload(file_path, file);
        if (error) throw error;
      }
      const { error } = await sb.from("messages").insert({ article_id: article.id, sender_id: ME.user.id, body: text, file_path, file_name });
      if (error) throw error;
      $("#chatText", box).value = ""; $("#chatFile", box).value = "";
      await load();
    } catch (err) { toast("Не отправилось: " + err.message); }
    btn.disabled = false;
  };
  $("#chatText", box).addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#chatForm", box).requestSubmit(); } });
  $("#chatFile", box).onchange = () => { const f = $("#chatFile", box).files[0]; if (f) toast("Прикреплен: " + f.name); };
  load();
  timer = setInterval(load, 4000);
  return () => clearInterval(timer);
}

/* отметить уведомления по статье прочитанными */
async function readNotifFor(link) {
  if (!ME.user) return;
  await sb.from("notifications").update({ is_read: true }).eq("link", link).eq("is_read", false);
  pollBell();
}
