/* Конструктор имени из пухлых букв — встраиваемый виджет.
 *
 * Подключение (Тильда, блок T123 «HTML-код», или любая страница):
 *   <div id="letters-constructor"></div>
 *   <script type="module" src="https://<адрес>/constructor.js"></script>
 *
 * 3D-модели берутся из папки shapes/ рядом с этим файлом.
 * Цены, палитра и размеры — в блоке «НАСТРОЙКИ» ниже.
 */

// ---------- разметка и стили ----------
const ROOT_ID = "letters-constructor";
let root = document.getElementById(ROOT_ID);
if (!root) { root = document.createElement("div"); root.id = ROOT_ID; document.body.append(root); }
if (!document.querySelector('link[data-lc-fonts]')) {
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.dataset.lcFonts = "";
  l.href = "https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=Nunito:wght@400;600;800&display=swap";
  document.head.append(l);
}
// Shadow DOM: стили страницы (Тильды) не попадают в виджет, а его стили — на страницу
const shadow = root.shadowRoot || root.attachShadow({ mode: "open" });
shadow.innerHTML = `<style>
:host { all: initial; display: block; }
/* Конструктор: слева/сверху 3D-сцена с именем, справа/снизу — настройки и цена */
.lc {
  --bg: #F6F2EE; --surface: #FFFFFF; --ink: #2B2340; --muted: #7A7290; --line: #E6DFE6;
  --accent: #FF6B8B; --accent-ink: #FFFFFF; --stage-a: #FBF7F2; --stage-b: #EFE6DC; --chip: #F3EEF2;
  color-scheme: light;
  --display: "Unbounded", "Arial Rounded MT Bold", system-ui, sans-serif;
  --body: "Nunito", ui-rounded, system-ui, sans-serif;
}

.lc, .lc * { box-sizing: border-box; }
.lc [hidden] { display: none !important; }
.lc { background: var(--bg); color: var(--ink); font-family: var(--body); font-size: 15px; line-height: 1.45; }
.lc button, .lc input { font: inherit; color: inherit; }
.lc .wrap { max-width: 1240px; margin: 0 auto; padding: 20px max(16px, env(safe-area-inset-right)) 40px max(16px, env(safe-area-inset-left));
  display: grid; gap: 16px; }
.lc h1 { font-family: var(--display); font-weight: 800; font-size: clamp(22px, 3.6vw, 34px); margin: 0; letter-spacing: -0.01em; }
.lc h1 span { color: var(--accent); }
.lc .lead { margin: 4px 0 0; color: var(--muted); }

.lc .main { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 18px; align-items: start; }
@media (max-width: 900px) { .lc .main { grid-template-columns: 1fr; } }
/* телефон: Имя → 3D → Цвет буквы → Высота и поверхность → Декор → Опции → Итого */
@media (max-width: 900px) {
  .lc .main { gap: 12px; }
  .lc .main > .panel { display: contents; }  /* сильнее общего .panel ниже по файлу */
  .lc .panel > :nth-child(1) { order: 1; }
  /* 3D прилипает к верху экрана и едет вместе со скроллом, пока листаешь настройки */
  .lc .main > .stage { order: 2; position: sticky; top: 0; z-index: 5; aspect-ratio: auto; height: min(78vw, 40vh);
    box-shadow: 0 10px 18px -12px rgba(40, 20, 50, .35); }
  /* вертикальный свайп по модели листает страницу, горизонтальный — крутит буквы */
  .lc .main > .stage canvas { touch-action: pan-y; }
  .lc .panel > :nth-child(3) { order: 3; }
  .lc .panel > :nth-child(2) { order: 4; }
  .lc .panel > :nth-child(4) { order: 5; }
  .lc .panel > :nth-child(5) { order: 6; }
  .lc .panel > :nth-child(6) { order: 7; }
}

.lc .stage { position: sticky; top: 12px; border-radius: 26px; overflow: hidden; aspect-ratio: 4 / 3;
  background: radial-gradient(120% 90% at 30% 15%, var(--stage-a), var(--stage-b)); }
@media (max-width: 900px) { .lc .stage { position: relative; top: 0; aspect-ratio: 5 / 4; } }
.lc .stage canvas { display: block; width: 100%; height: 100%; touch-action: none; cursor: grab; }
.lc .stage .hint { position: absolute; left: 16px; bottom: 12px; color: var(--muted); font-size: 12.5px; pointer-events: none; }
.lc .stage .loading { position: absolute; inset: 0; display: grid; place-items: center; color: var(--muted); font-weight: 700;
  pointer-events: none; transition: opacity .2s; }
.lc .trash { position: absolute; left: 0; top: 0; width: 40px; height: 40px; margin: -56px 0 0 -20px; border-radius: 50%; border: 0;
  background: var(--surface); color: #E0455F; box-shadow: 0 3px 12px rgba(40, 20, 50, .22); cursor: pointer;
  display: grid; place-items: center; z-index: 2; }
.lc .trash:hover { color: #fff; background: #E0455F; }
.lc .trash svg { width: 20px; height: 20px; }
.lc .stage .empty { position: absolute; inset: 0; display: grid; place-items: center; color: var(--muted); font-family: var(--display);
  font-size: 18px; pointer-events: none; }

.lc .panel { display: grid; gap: 12px; }
.lc .card { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 14px 16px; display: grid; gap: 10px; }
.lc .card h2 { margin: 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
.lc .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.lc .name-input { width: 100%; padding: 12px 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg);
  font-family: var(--display); font-size: 22px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; outline: none; }
.lc .name-input:focus { border-color: var(--accent); }
.lc .small { font-size: 12.5px; color: var(--muted); }

.lc .seg { display: flex; background: var(--chip); border-radius: 14px; padding: 4px; gap: 4px; }
.lc .seg button { flex: 1; border: 0; background: transparent; padding: 8px 6px; border-radius: 10px; cursor: pointer; font-weight: 700;
  display: grid; line-height: 1.15; }
.lc .seg button small { font-weight: 600; color: var(--muted); font-size: 11.5px; }
.lc .seg button[aria-pressed="true"] { background: var(--surface); box-shadow: 0 1px 4px rgba(0,0,0,.12); }
.lc .seg button:disabled { opacity: .4; cursor: not-allowed; }

.lc .sel-title { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.lc .sel-title b { font-family: var(--display); font-size: 16px; }
.lc .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 8px; }
.lc .sw { aspect-ratio: 1; border-radius: 50%; border: 2px solid rgba(0,0,0,.08); cursor: pointer; position: relative; padding: 0; }
.lc .sw[aria-pressed="true"] { outline: 3px solid var(--accent); outline-offset: 2px; }
.lc .sw.silk { background-image: linear-gradient(135deg, rgba(255,255,255,.75) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,.45) 70%, rgba(255,255,255,0) 100%) !important; background-blend-mode: normal; }
.lc .colname { font-size: 13px; color: var(--muted); min-height: 1.2em; }
.lc .btn { border: 0; border-radius: 12px; padding: 9px 12px; background: var(--chip); cursor: pointer; font-weight: 700; }
.lc .btn:hover { filter: brightness(.97); }
.lc .btn.primary { background: var(--accent); color: var(--accent-ink); padding: 14px 16px; font-size: 17px; width: 100%; }
.lc .btn.icon { padding: 8px 11px; }
.lc .tabs { display: flex; gap: 6px; }
.lc .tabs .btn[aria-pressed="true"] { background: var(--ink); color: var(--surface); }

.lc .decor { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.lc .decor .btn { display: grid; gap: 2px; padding: 10px 6px; }
.lc .decor .btn span { font-size: 22px; line-height: 1; }
.lc .decor .btn small { font-weight: 600; color: var(--muted); }
.lc label.check { display: flex; gap: 10px; align-items: center; cursor: pointer; }
.lc label.check input { width: 20px; height: 20px; accent-color: var(--accent); }

.lc .bill { display: grid; gap: 4px; font-variant-numeric: tabular-nums; }
.lc .bill div { display: flex; justify-content: space-between; gap: 12px; }
.lc .bill div span:first-child { color: var(--muted); }
.lc .total { display: flex; justify-content: space-between; align-items: baseline; font-family: var(--display); font-size: 24px; font-weight: 800;
  border-top: 1px dashed var(--line); padding-top: 8px; }

.lc dialog { border: 0; border-radius: 20px; padding: 20px; max-width: min(520px, calc(100vw - 32px)); background: var(--surface); color: var(--ink); }
.lc dialog::backdrop { background: rgba(20, 15, 35, .45); }
.lc dialog pre { white-space: pre-wrap; background: var(--bg); padding: 12px; border-radius: 12px; font-family: var(--body); font-size: 14px; margin: 10px 0; }
</style>
<div class="lc">
<div class="wrap">
  <header>
    <h1>Введите имя, нажмите на букву и выберите цвет.</h1>
    <p class="lead">Модель можно повернуть.</p>
  </header>
  <div class="main">
    <div class="stage" id="lc-stage">
      <button class="trash" id="lc-trash" hidden title="Удалить" aria-label="Удалить">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>
      </button>
      <div class="empty" id="lc-empty">Введите имя ✨</div>
      <div class="loading" id="lc-loading" style="opacity:0">Загружаем буквы…</div>
      <div class="hint">Нажмите на букву, чтобы покрасить · потяните, чтобы повернуть</div>
    </div>

    <div class="panel">
      <section class="card">
        <h2>Имя</h2>
        <input class="name-input" id="lc-name" maxlength="12" autocomplete="off" spellcheck="false" placeholder="ИМЯ" value="ИМЯ" aria-label="Имя">
        <div class="small" id="lc-name-note">Русские и латинские буквы, цифры — до 12 знаков</div>
      </section>

      <section class="card">
        <h2>Высота букв</h2>
        <div class="seg" id="lc-sizes"></div>
        <div class="small" id="lc-size-note" hidden>У некоторых букв своя высота. Выбор здесь сделает все буквы одинаковыми.</div>
        <h2 style="margin-top:6px">Поверхность</h2>
        <div class="seg" id="lc-seg-surface"></div>
        <div class="small" id="lc-surf-note" hidden>У некоторых букв своя поверхность. Выбор здесь сделает её одинаковой у всех.</div>
        <div class="small" id="lc-silk-note" hidden>Шёлковые буквы покрываются смолой не будут — они и так блестят.</div>
      </section>

      <section class="card" id="lc-sel-card">
        <div class="sel-title"><b id="lc-sel-name">Выберите букву</b>
          <span class="row" id="lc-sel-actions"></span></div>
        <div class="tabs" id="lc-cone-tabs" hidden>
          <button class="btn" data-part="0" aria-pressed="true">Корпус</button>
          <button class="btn" data-part="1" aria-pressed="false">Полосы</button>
        </div>
        <div class="swatches" id="lc-sw-regular"></div>
        <div class="small">Шёлк · +30%</div>
        <div class="swatches" id="lc-sw-silk"></div>
        <div class="colname" id="lc-colname"></div>
        <div class="row">
          <button class="btn" id="lc-paint-all">Покрасить все в этот цвет</button>
        </div>
        <div class="row">
          <button class="btn" id="lc-random">🎲 Случайная расцветка</button>
        </div>
        <label class="check small" id="lc-heart-row" hidden><input type="checkbox" id="lc-heart"> Сердечко внутри вместо круглой дырочки</label>
        <div id="lc-sel-size" hidden>
          <div class="small" style="margin-bottom:6px">Высота этой буквы</div>
          <div class="seg" id="lc-seg-size-one"></div>
        </div>
        <div id="lc-sel-surface" hidden>
          <div class="small" style="margin-bottom:6px">Поверхность этой буквы</div>
          <div class="seg" id="lc-seg-surface-one"></div>
        </div>
      </section>


      <section class="card">
        <h2>Декор</h2>
        <div class="decor" id="lc-decor"></div>
      </section>

      <section class="card">
        <label class="check"><input type="checkbox" id="lc-hole"> Отверстие под саморез — бесплатно</label>
        <label class="check"><input type="checkbox" id="lc-magnets"> <span id="lc-magnets-label">Магниты</span></label>
      </section>

      <section class="card">
        <div class="bill" id="lc-bill"></div>
        <div class="total"><span>Итого</span><span id="lc-total">0 ₽</span></div>
        <button class="btn primary" id="lc-to-cart">В корзину</button>
      </section>
    </div>
  </div>
</div>

<dialog id="lc-order">
  <b style="font-family:var(--display)">Заказ собран</b>
  <pre id="lc-order-text"></pre>
  <div class="small" id="lc-order-note">В прототипе заказ показывается здесь. На Тильде он уйдёт в корзину.</div>
  <div class="row" style="margin-top:12px; justify-content:flex-end">
    <button class="btn" id="lc-copy">Скопировать</button>
    <button class="btn" id="lc-close">Закрыть</button>
  </div>
</dialog>

</div>`;
const $ = id => shadow.getElementById("lc-" + id);

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/+esm";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js/+esm";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js/+esm";

// ======================= НАСТРОЙКИ (цены, палитра) =======================
const SHAPES_URL = new URL("./shapes/", import.meta.url).href;   // модели лежат рядом с этим файлом
const SIZES = [8, 10, 12, 14, 16, 18, 20, 22, 24];
const ENABLED_SIZES = [8, 10, 12];          // большие размеры включить после пробной печати
const BASE  = {8: 350, 10: 400, 12: 450, 14: 700, 16: 950, 18: 1200, 20: 1500, 22: 1750, 24: 2000};
const GLOSS = {8: 150, 10: 165, 12: 180, 14: 240, 16: 300, 18: 360, 20: 420, 22: 480, 24: 540};
const STAR_K = 0.7, SILK_K = 1.3;
const MAGNET = 50;                          // магнит на каждый символ (буква, цифра, декор)
const MAX_CHARS = 12, MAX_DECOR = 4;

// rough — шероховатость пластика (Matte — матовый, Basic/Lite — с лёгким блеском)
const COLORS = [
  {id: "white",    name: "Белый",          fil: "Jade White, PLA Basic",     hex: "#F4F2EC", rough: .45},
  {id: "black",    name: "Чёрный",         fil: "Black, PLA Lite",           hex: "#2A2A2C", rough: .45},
  {id: "gray",     name: "Серый",          fil: "Gray, PLA Lite",            hex: "#9A9C98", rough: .45},
  {id: "graphite", name: "Графит",         fil: "Blue Gray, PLA Basic",      hex: "#5B6579", rough: .45},
  {id: "red",      name: "Красный",        fil: "Red, PLA Lite",             hex: "#E0382E", rough: .45},
  {id: "orange",   name: "Оранжевый",      fil: "Orange, PLA Basic",         hex: "#FF7A1A", rough: .45},
  {id: "mandarin", name: "Мандарин",       fil: "Mandarin Orange, PLA Matte",hex: "#F7A060", rough: .8},
  {id: "lemon",    name: "Лимонный",       fil: "светло-жёлтый, PLA Matte",  hex: "#F3E08A", rough: .8},
  {id: "mint",     name: "Мятный",         fil: "Grass Green, PLA Matte",    hex: "#7FD39B", rough: .8},
  {id: "blue",     name: "Голубой",        fil: "голубой, PLA Matte",        hex: "#5C8FE0", rough: .8},
  {id: "plum",     name: "Сливовый",       fil: "Plum, PLA Matte",           hex: "#B23A78", rough: .8},
  {id: "powder",   name: "Пудровый",       fil: "розовый, PLA Pure",         hex: "#F6CFCB", rough: .6},
  {id: "silk_blue",  name: "Шёлк голубой",   fil: "Baby Blue, PLA Silk+", hex: "#A9C6EE", silk: true},
  {id: "silk_peach", name: "Шёлк персиковый", fil: "Pink, PLA Silk+",      hex: "#F5B5AE", silk: true},
];
const COL = Object.fromEntries(COLORS.map(c => [c.id, c]));
const SURFACES = [
  {id: "plain", name: "Обычная"},
  {id: "fuzzy", name: "Шершавая"},
  {id: "gloss", name: "Глянец"},
];
const DECOR = {
  star:  {name: "Звёздочка", icon: "★", shapes: ["star"]},
  heart: {name: "Сердечко",  icon: "♥", shapes: ["heart"]},
  cone:  {name: "Конус",     icon: "▲", shapes: ["cone_body", "cone_stripes"]},
};
const ABC = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
const LAT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const HEART_O = { "О": "ru_16h", "O": "la_Oh" };   // О и O можно заказать с сердечком внутри
const itemShape = it => it.heart && HEART_O[it.ch] ? HEART_O[it.ch] : charShape(it.ch);
const isChar = c => ABC.includes(c) || LAT.includes(c) || /\d/.test(c);
const charShape = ch => /\d/.test(ch) ? "d" + ch : LAT.includes(ch) ? "la_" + ch : "ru_" + String(ABC.indexOf(ch) + 1).padStart(2, "0");

// ======================= СОСТОЯНИЕ =======================
// item: {kind: "char", ch, colors: [id], surface} | {kind: "star"|"heart"|"cone", colors: [id, id?], surface}
const S = { items: [], size: 10, surface: "plain", hole: false, magnets: false, sel: -1, part: 0 };
const newItem = (kind, ch) => ({ kind, ch, colors: kind === "cone" ? ["orange", "white"] : ["white"], surface: null, size: null });

function setName(raw) {
  const clean = [...raw.toUpperCase().replace(/Ё/g, "Ё")].filter(isChar).slice(0, MAX_CHARS);
  const old = S.items.filter(i => i.kind === "char");
  // сохраняем настройки совпадающего начала и конца имени
  let p = 0; while (p < old.length && p < clean.length && old[p].ch === clean[p]) p++;
  let s = 0; while (s < old.length - p && s < clean.length - p && old[old.length - 1 - s].ch === clean[clean.length - 1 - s]) s++;
  const chars = clean.map((ch, i) => i < p ? old[i] : i >= clean.length - s ? old[old.length - (clean.length - i)] : newItem("char", ch));
  // декор остаётся после того же числа букв
  const out = []; let ci = 0, before = 0; const decorAt = [];
  for (const it of S.items) { if (it.kind === "char") before++; else decorAt.push([Math.min(before, chars.length), it]); }
  for (let k = 0; k <= chars.length; k++) {
    for (const [at, d] of decorAt) if (at === k) out.push(d);
    if (k < chars.length) out.push(chars[k]);
  }
  const selItem = S.items[S.sel];
  S.items = out;
  S.sel = out.indexOf(selItem);
  // поле показывает ровно то, что пойдёт в заказ: лишние знаки и всё сверх 12 не вводятся
  const inp = $("name"), val = clean.join("");
  if (inp.value !== val) inp.value = val;
  $("name-note").textContent = `Русские и латинские буквы, цифры · ${clean.length} из ${MAX_CHARS}`;
}

const isSilk = it => it.colors.some(c => COL[c].silk);
const sizeOf = it => it.size ?? S.size;
const mixedSize = () => new Set(S.items.map(sizeOf)).size > 1;
// у буквы своя поверхность или общая (null)
const wantSurf = it => it.surface ?? S.surface;
const mixedSurf = () => new Set(S.items.map(wantSurf)).size > 1;
const surfOf = it => { const s = wantSurf(it); return s === "gloss" && isSilk(it) ? "plain" : s; };

// ======================= ЦЕНА =======================
function itemPrice(it) {
  let base = BASE[sizeOf(it)] * (it.kind === "star" ? STAR_K : 1);
  const b = Math.round(base), silk = isSilk(it) ? Math.round(base * SILK_K) - b : 0;
  const gloss = surfOf(it) === "gloss" ? GLOSS[sizeOf(it)] : 0;
  return { b, silk, gloss, total: b + silk + gloss };
}
function bill() {
  const lines = new Map(); let total = 0;
  const add = (k, n, sum) => { const v = lines.get(k) || [0, 0]; lines.set(k, [v[0] + n, v[1] + sum]); };
  for (const it of S.items) {
    const p = itemPrice(it); total += p.total;
    const label = it.kind === "char" ? (/\d/.test(it.ch) ? "Цифры" : "Буквы") : DECOR[it.kind].name;
    add(`${label} ${sizeOf(it)} см`, 1, p.b);
    if (p.silk) add("Шёлк +30%", 1, p.silk);
    if (p.gloss) add("Глянец смолой", 1, p.gloss);
  }
  if (S.hole && S.items.length) add("Отверстие под саморез", 0, 0);
  if (S.magnets && S.items.length) { add("Магниты", S.items.length, MAGNET * S.items.length); total += MAGNET * S.items.length; }
  return { lines, total };
}
const rub = n => n.toLocaleString("ru-RU") + " ₽";

// ======================= 3D =======================
const stage = $("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
// Свет. Linear не искажает оттенки (цвета как в палитре), но даёт крутить общую яркость.
// Подбор: открыть страницу с ?tune — появятся ползунки, значения потом вписать сюда.
const LIGHT = { exposure: 0.8, env: 0.75, sun: 0.55 };
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = LIGHT.exposure;
stage.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), 0.04).texture;
const sun = new THREE.DirectionalLight(0xffffff, LIGHT.sun); sun.position.set(-80, 140, 200); scene.add(sun);
const camera = new THREE.PerspectiveCamera(28, 1, 1, 5000);
const controls = new OrbitControls(camera, renderer.domElement);
Object.assign(controls, { enableDamping: true, enablePan: false, minAzimuthAngle: -0.75, maxAzimuthAngle: 0.75,
  minPolarAngle: 0.95, maxPolarAngle: 2.0, rotateSpeed: 0.7 });
const row = new THREE.Group(); scene.add(row);
const marker = new THREE.Mesh(new THREE.CapsuleGeometry(2.2, 26, 4, 12).rotateZ(Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: 0xff6b8b, roughness: .4 }));
marker.visible = false; scene.add(marker);

const geoCache = new Map();
async function loadGeo(id) {
  if (!geoCache.has(id)) geoCache.set(id, fetch(SHAPES_URL + id + ".bin").then(r => {
    if (!r.ok) throw new Error(id); return r.arrayBuffer();
  }).then(buf => {
    const dv = new DataView(buf), nv = dv.getInt32(0, true), nt = dv.getInt32(4, true);
    const lo = [0, 1, 2].map(i => dv.getFloat32(8 + 4 * i, true)), st = [0, 1, 2].map(i => dv.getFloat32(20 + 4 * i, true));
    const q = new Uint16Array(buf, 32, nv * 3), pos = new Float32Array(nv * 3);
    for (let i = 0; i < nv * 3; i++) pos[i] = lo[i % 3] + q[i] * st[i % 3];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setIndex(new THREE.BufferAttribute(new Uint16Array(buf, 32 + nv * 6, nt * 3), 1));
    g.computeVertexNormals(); g.computeBoundingBox();
    return g;
  }));
  return geoCache.get(id);
}

// шершавость: шум в нормалях (как fuzzy skin — мелкая «шкурка»)
function fuzzify(m) {
  m.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vObj;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
      varying vec3 vObj;
      float h3(vec3 p){ return fract(sin(dot(floor(p), vec3(127.1,311.7,74.7))) * 43758.5453); }`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
      { vec3 p = vObj * 2.6; vec3 n3 = vec3(h3(p), h3(p + 17.0), h3(p + 41.0)) - 0.5;
        normal = normalize(normal + 0.55 * n3); }`);
  };
  m.customProgramCacheKey = () => "fuzzy";
  return m;
}
function material(colorId, surf) {
  const c = COL[colorId];
  const m = new THREE.MeshPhysicalMaterial({ color: c.hex, roughness: c.rough ?? .45, metalness: 0, envMapIntensity: .9 });
  if (c.silk) Object.assign(m, { metalness: .55, roughness: .28, sheen: 1, sheenColor: new THREE.Color(c.hex), envMapIntensity: 1.3 });
  if (surf === "gloss") Object.assign(m, { clearcoat: 1, clearcoatRoughness: .04, roughness: Math.min(m.roughness, .35), envMapIntensity: 1.2 });
  if (surf === "fuzzy") { m.roughness = .95; m.envMapIntensity = .6; fuzzify(m); }
  m.userData.env = m.envMapIntensity; m.envMapIntensity *= LIGHT.env;
  return m;
}

const GAP = 7, H_MID = 33.5;
let buildToken = 0, fitWidth = 0, fitTop = 80;
async function rebuild(refit) {
  const token = ++buildToken;
  const need = S.items.flatMap(it => it.kind === "char" ? [itemShape(it)] : DECOR[it.kind].shapes);
  const loading = $("loading");
  const t = setTimeout(() => loading.style.opacity = 1, 150);
  let geos;
  try { geos = await Promise.all(need.map(loadGeo)); }
  catch (e) { loading.textContent = "Не удалось загрузить буквы"; loading.style.opacity = 1; return; }
  finally { clearTimeout(t); }
  if (token !== buildToken) return;
  loading.style.opacity = 0;
  row.children.slice().forEach(ch => { row.remove(ch); ch.traverse(o => o.material && o.material.dispose()); });
  let x = 0, gi = 0;
  S.items.forEach((it, idx) => {
    const grp = new THREE.Group(); grp.userData.idx = idx;
    const ids = it.kind === "char" ? [itemShape(it)] : DECOR[it.kind].shapes;
    const bb = new THREE.Box3();
    ids.forEach((id, k) => {
      const g = geos[gi++];
      const mesh = new THREE.Mesh(g, material(it.colors[k] ?? it.colors[0], surfOf(it)));
      mesh.userData.idx = idx; grp.add(mesh); bb.union(g.boundingBox);
    });
    // буквы стоят на общей линии; декор — по центру высоты букв
    // своя высота буквы — масштаб относительно общей; низ букв на общей линии
    const sc = sizeOf(it) / S.size;
    grp.scale.setScalar(sc);
    const dy = it.kind === "char" ? 0 : H_MID * sc - (bb.min.y + bb.max.y) / 2 * sc;
    const w = (bb.max.x - bb.min.x) * sc;
    grp.position.set(x - bb.min.x * sc, dy, 0);
    grp.userData.w = w; grp.userData.cx = x + w / 2; grp.userData.minY = bb.min.y * sc + dy; grp.userData.maxY = bb.max.y * sc + dy;
    x += w + GAP;
    row.add(grp);
  });
  const total = Math.max(0, x - GAP);
  row.position.x = -total / 2;
  $("empty").hidden = S.items.length > 0;
  updateMarker();
  const top = Math.max(80, ...row.children.map(g => g.userData.maxY));
  if (refit || Math.abs(total - fitWidth) > 1 || Math.abs(top - fitTop) > 1) fit(total, top);
}
function fit(width, top = fitTop) {
  fitWidth = width; fitTop = top;
  const aspect = stage.clientWidth / stage.clientHeight;
  const halfH = Math.max(65 * top / 80, (width / 2 + 20) / aspect);
  const d = halfH / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  controls.target.set(0, (top - 10) / 2, 10);
  const dir = fitWidth && camera.userData.placed ? camera.position.clone().sub(controls.target) : new THREE.Vector3(-0.22, 0.14, 1);
  camera.userData.placed = true;
  camera.position.copy(controls.target).add(dir.normalize().multiplyScalar(d));
  camera.far = d * 4; camera.updateProjectionMatrix();
}
function updateMarker() {
  const g = row.children.find(c => c.userData.idx === S.sel);
  marker.visible = !!g;
  if (g) marker.position.set(row.position.x + g.userData.cx, Math.min(-12, g.userData.minY - 8), 10);
}
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  if (fitWidth) fit(fitWidth);
}
new ResizeObserver(resize).observe(stage);
// ?tune — ползунки света для подбора
if (new URLSearchParams(location.search).has("tune")) {
  const box = document.createElement("div");
  box.style.cssText = "position:absolute;right:12px;top:12px;z-index:3;background:rgba(255,255,255,.92);padding:10px 12px;border-radius:14px;font-size:13px;display:grid;gap:4px;width:220px";
  const apply = () => {
    renderer.toneMappingExposure = LIGHT.exposure; sun.intensity = LIGHT.sun;
    row.traverse(o => { if (o.material) o.material.envMapIntensity = o.material.userData.env * LIGHT.env; });
  };
  for (const [k, label, max] of [["exposure", "Яркость", 2], ["env", "Отражения", 2], ["sun", "Солнце", 2]]) {
    const l = document.createElement("label"); l.style.cssText = "display:grid;gap:2px";
    const v = document.createElement("b"), r = document.createElement("input");
    Object.assign(r, { type: "range", min: 0, max, step: 0.05, value: LIGHT[k] });
    const show = () => v.textContent = `${label}: ${(+r.value).toFixed(2)}`;
    r.oninput = () => { LIGHT[k] = +r.value; show(); apply(); }; show();
    l.append(v, r); box.append(l);
  }
  stage.append(box);
}

// корзина над выбранной буквой: каждый кадр переносим её в экранную точку над верхом буквы
const trash = $("trash"), tv = new THREE.Vector3();
function placeTrash() {
  const g = row.children.find(c => c.userData.idx === S.sel);
  trash.hidden = !g;
  if (!g) return;
  tv.set(row.position.x + g.userData.cx, g.userData.maxY, 10).project(camera);
  trash.style.transform = `translate(${(tv.x + 1) / 2 * stage.clientWidth}px, ${(1 - tv.y) / 2 * stage.clientHeight}px)`;
}
trash.onclick = () => removeSel();
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); placeTrash(); });

// выбор буквы тапом (без перетаскивания)
const ray = new THREE.Raycaster(); let down = null;
renderer.domElement.addEventListener("pointerdown", e => down = [e.clientX, e.clientY]);
renderer.domElement.addEventListener("pointerup", e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
  const r = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
  const hit = ray.intersectObjects(row.children, true)[0];
  select(hit ? hit.object.userData.idx : -1);
});

// ======================= ИНТЕРФЕЙС =======================
function segButtons(el, opts, cur, onPick) {
  el.innerHTML = "";
  for (const o of opts) {
    const b = document.createElement("button");
    b.innerHTML = o.html; b.setAttribute("aria-pressed", o.id === cur); b.disabled = !!o.disabled;
    b.onclick = () => onPick(o.id); el.append(b);
  }
}
function select(i) { S.sel = i; S.part = 0; renderUI(); updateMarker(); }

function renderUI() {
  segButtons($("sizes"), SIZES.filter(s => ENABLED_SIZES.includes(s)).map(s => ({ id: s, html: `${s} см<small>${rub(BASE[s])}</small>` })),
    mixedSize() ? null : S.size, s => { S.size = s; S.items.forEach(i => i.size = null); rebuild(); renderUI(); });
  $("size-note").hidden = !mixedSize();
  const surfOpts = cur => SURFACES.map(s => ({ id: s.id, html: s.name + `<small>${s.id === "gloss" ? "+" + rub(GLOSS[S.size]) : "бесплатно"}</small>` }));
  segButtons($("seg-surface"), surfOpts(), mixedSurf() ? null : S.surface, s => {
    S.surface = s; S.items.forEach(i => i.surface = null); rebuild(); renderUI();
  });
  $("surf-note").hidden = !mixedSurf();
  $("silk-note").hidden = !S.items.some(it => isSilk(it) && wantSurf(it) === "gloss");
  $("hole").checked = S.hole;
  $("magnets").checked = S.magnets;
  const nm = S.items.length;
  $("magnets-label").textContent = nm ? `Магниты — +${rub(MAGNET * nm)} (${nm} шт. × ${rub(MAGNET)})` : `Магниты — ${rub(MAGNET)} за символ`;

  const it = S.items[S.sel];
  $("sel-card").style.opacity = it ? 1 : .55;
  $("sel-name").textContent = !it ? "Нажмите на букву на картинке"
    : it.kind === "char" ? (/\d/.test(it.ch) ? `Цифра ${it.ch}` : `Буква ${it.ch}`) : DECOR[it.kind].name;
  const acts = $("sel-actions"); acts.innerHTML = "";
  if (it && it.kind !== "char") {
    const mk = (t, title, fn) => { const b = document.createElement("button"); b.className = "btn icon"; b.textContent = t; b.title = title; b.onclick = fn; acts.append(b); };
    mk("←", "Левее", () => move(-1)); mk("→", "Правее", () => move(1));
  }
  $("cone-tabs").hidden = !(it && it.kind === "cone");
  [...$("cone-tabs").children].forEach(b => b.setAttribute("aria-pressed", +b.dataset.part === S.part));
  const cur = it ? it.colors[it.kind === "cone" ? S.part : 0] : null;
  for (const [el, silk] of [[$("sw-regular"), false], [$("sw-silk"), true]]) {
    el.innerHTML = "";
    COLORS.filter(c => !!c.silk === silk).forEach(c => {
      const b = document.createElement("button");
      b.className = "sw" + (silk ? " silk" : ""); b.style.backgroundColor = c.hex; b.title = c.name;
      b.setAttribute("aria-label", c.name); b.setAttribute("aria-pressed", c.id === cur); b.disabled = !it;
      b.onclick = () => paint(c.id); el.append(b);
    });
  }
  $("colname").textContent = cur ? `${COL[cur].name}${COL[cur].silk ? " · +30%" : ""}` : "";
  $("paint-all").disabled = !it;
  $("random").disabled = !S.items.length;
  $("sel-surface").hidden = !it;
  $("sel-size").hidden = !it;
  $("heart-row").hidden = !(it && it.kind === "char" && HEART_O[it.ch]);
  if (it) $("heart").checked = !!it.heart;
  if (it) segButtons($("seg-size-one"), SIZES.filter(s => ENABLED_SIZES.includes(s)).map(s => ({ id: s, html: `${s} см` })),
    sizeOf(it), s => { it.size = s === S.size ? null : s; rebuild(); renderUI(); });
  if (it) segButtons($("seg-surface-one"), surfOpts(), wantSurf(it), s => { it.surface = s === S.surface ? null : s; rebuild(); renderUI(); });

  const dec = $("decor"); dec.innerHTML = "";
  const nDecor = S.items.filter(i => i.kind !== "char").length;
  for (const [k, d] of Object.entries(DECOR)) {
    const b = document.createElement("button"); b.className = "btn";
    const p = Math.round(BASE[S.size] * (k === "star" ? STAR_K : 1));
    b.innerHTML = `<span>${d.icon}</span>${d.name}<small>${rub(p)}</small>`;
    b.disabled = nDecor >= MAX_DECOR;
    b.onclick = () => { S.items.push(newItem(k)); S.sel = S.items.length - 1; rebuild(); renderUI(); };
    dec.append(b);
  }

  const { lines, total } = bill();
  $("bill").innerHTML = [...lines].map(([k, [n, sum]]) =>
    `<div><span>${k}${n > 1 ? " × " + n : ""}</span><span>${sum ? (/^(Шёлк|Глянец|Магниты)/.test(k) ? "+" : "") + rub(sum) : "бесплатно"}</span></div>`).join("");
  $("total").textContent = rub(total);
  $("to-cart").disabled = !S.items.length;
}
function paint(cid) {
  const it = S.items[S.sel]; if (!it) return;
  it.colors[it.kind === "cone" ? S.part : 0] = cid; rebuild(); renderUI();
}
// случайная расцветка: берём один из подобранных наборов (3–4 цвета, которые хорошо смотрятся вместе)
// и раскладываем по буквам так, чтобы соседние не совпадали. Шёлк не используем — чтобы не менять цену.
const SETS = [
  ["mint", "plum", "mandarin"], ["blue", "lemon", "powder"], ["graphite", "orange", "white"],
  ["plum", "powder", "white", "lemon"], ["red", "white", "blue"], ["mint", "lemon", "blue", "powder"],
  ["gray", "graphite", "orange", "white"], ["mandarin", "mint", "lemon"], ["black", "white", "red"],
  ["plum", "mint", "powder"], ["blue", "mandarin", "white"], ["lemon", "graphite", "mint"],
];
let lastSet = -1;
$("random").onclick = () => {
  let k; do k = Math.floor(Math.random() * SETS.length); while (k === lastSet && SETS.length > 1);
  lastSet = k;
  const set = [...SETS[k]].sort(() => Math.random() - .5);
  let prev = null, i = 0;
  for (const it of S.items) {
    // идём по набору по кругу со случайным сдвигом — все цвета набора появятся, соседи разные
    let c = set[(i + (Math.random() < .3 ? 1 : 0)) % set.length];
    if (c === prev) c = set[(set.indexOf(c) + 1) % set.length];
    i = set.indexOf(c) + 1;
    if (it.kind === "cone") it.colors = [c, c === "white" ? "orange" : "white"]; else it.colors[0] = c;
    prev = c;
  }
  rebuild(); renderUI();
};
$("paint-all").onclick = () => {
  const it = S.items[S.sel]; if (!it) return;
  const cid = it.colors[it.kind === "cone" ? S.part : 0];
  S.items.forEach(x => { if (x.kind === "cone") x.colors[0] = cid; else x.colors[0] = cid; });
  rebuild(); renderUI();
};
function move(d) {
  const i = S.sel, j = i + d; if (j < 0 || j >= S.items.length) return;
  [S.items[i], S.items[j]] = [S.items[j], S.items[i]]; S.sel = j; rebuild(); renderUI();
}
function removeSel() {
  if (!S.items[S.sel]) return;
  S.items.splice(S.sel, 1); S.sel = -1;
  // буквы — это и есть имя в поле ввода
  $("name").value = S.items.filter(i => i.kind === "char").map(i => i.ch).join("");
  rebuild(); renderUI();
}
$("cone-tabs").onclick = e => { const b = e.target.closest("button"); if (b) { S.part = +b.dataset.part; renderUI(); } };
$("heart").onchange = e => { const it = S.items[S.sel]; if (it) { it.heart = e.target.checked; rebuild(); renderUI(); } };
$("hole").onchange = e => { S.hole = e.target.checked; renderUI(); };
$("magnets").onchange = e => { S.magnets = e.target.checked; renderUI(); };
$("name").addEventListener("input", e => { setName(e.target.value); rebuild(); renderUI(); });

// ======================= ЗАКАЗ =======================
function orderText() {
  const decor = S.items.filter(i => i.kind !== "char").map(i => DECOR[i.kind].name.toLowerCase());
  const word = `«${S.items.filter(i => i.kind === "char").map(i => i.ch).join("")}»` + (decor.length ? " + " + decor.join(", ") : "");
  const surfName = id => SURFACES.find(s => s.id === id).name.toLowerCase();
  const parts = S.items.map(it => {
    const head = it.kind === "char" ? it.ch + (LAT.includes(it.ch) ? " (лат.)" : "") + (it.heart && HEART_O[it.ch] ? " с сердечком" : "")
      : DECOR[it.kind].name.toLowerCase();
    const cols = it.colors.map(c => `${COL[c].name} (${COL[c].fil})`).join(" / ");
    const surf = surfOf(it), extra = mixedSurf() ? `, ${surfName(surf)}` : "";
    return `${head}${mixedSize() ? ` (${sizeOf(it)} см)` : ""} — ${cols}${extra}`;
  });
  const tg = window.Telegram?.WebApp?.initDataUnsafe?.user;
  return {
    title: `Имя ${word}, ${mixedSize() ? "разной высоты" : S.size + " см"}`,
    text: [`Имя ${word}, ${mixedSize() ? "высота у букв разная" : "высота " + S.size + " см"}`, ...parts,
      `Поверхность: ${mixedSurf() ? "у букв разная" : surfName(S.surface)}`,
      `Отверстие под саморез: ${S.hole ? "да" : "нет"}`,
      `Магниты: ${S.magnets ? "да, " + S.items.length + " шт." : "нет"}`,
      tg ? `Telegram: ${[tg.first_name, tg.last_name].filter(Boolean).join(" ")}${tg.username ? " @" + tg.username : ""}` : null,
      `Итого: ${rub(bill().total)}`].filter(Boolean).join("\n"),
  };
}
$("to-cart").onclick = () => {
  const o = orderText(), price = bill().total;
  if (typeof window.tcart__addProduct === "function") {
    // корзина Тильды: формат проверить на живом аккаунте
    window.tcart__addProduct({ name: o.title, price, quantity: 1, options: [{ option: "Состав", variant: o.text }] });
    if (typeof window.tcart__openCart === "function") window.tcart__openCart();
    return;
  }
  $("order-text").textContent = o.text; $("order").showModal();
};
$("close").onclick = () => $("order").close();
$("copy").onclick = () => navigator.clipboard?.writeText($("order-text").textContent).then(() => $("copy").textContent = "Скопировано");

// Telegram: на весь экран; оформление всегда светлое, тема устройства не влияет
function initTelegram() {
  const tg = window.Telegram?.WebApp;
  if (tg && tg.initData) { tg.ready(); tg.expand(); tg.setHeaderColor?.("#F6F2EE"); tg.setBackgroundColor?.("#F6F2EE"); }
}
if (window.Telegram?.WebApp) initTelegram();
else {
  const s = document.createElement("script");
  s.src = "https://telegram.org/js/telegram-web-app.js"; s.onload = initTelegram; document.head.append(s);
}

setName($("name").value);
// стартовое слово раскрашено для примера; новые буквы, которые введёт покупатель, — белые
const DEMO = { "И": "mint", "М": "plum", "Я": "mandarin" };
S.items.forEach(it => { if (DEMO[it.ch]) it.colors[0] = DEMO[it.ch]; });
rebuild(true); renderUI();
