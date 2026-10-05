// Generates every image in assets/ (a dark and a light copy of each).
// Edit the content below, then run:  node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── content ──────────────────────────────────────────────────────────────────

const profile = {
  name: 'Kevin Sudhan',
  status: 'Building Araxys · Chennai, IN',
  role: 'AI agent engineer & full-stack developer',
  tagline:
    'I build agents that do real work — voice desks, grounded retrieval, and the automation around them.',
  readout: ['Agents', 'Voice', 'Retrieval', 'Automation'],
  site: 'resumekevin.netlify.app',
  signoff: 'Building the future, one pixel at a time',
};

const projects = [
  {
    slug: 'harness',
    title: 'Domain-Specific Harness',
    label: 'Operations platform',
    desc: 'Describe a business in one line and get a running operations system — billing, pipeline, mail, scheduling and approvals, composed from modules.',
    tags: ['TypeScript', 'n8n', 'Voice agents', 'Docker'],
  },
  {
    slug: 'dyna-braille',
    title: 'Dyna Braille',
    label: 'Assistive hardware',
    desc: 'A camera spots what’s around you, a local LLM describes it aloud, and solenoids raise it as live Braille — built for visually impaired users.',
    tags: ['Python', 'YOLOv8', 'OpenCV', 'Ollama', 'ESP32'],
  },
  {
    slug: 'localflow',
    title: 'LocalFlow',
    label: 'On-device voice',
    desc: 'Hold a key in any Windows app, speak, let go — polished text lands at your cursor. Recognition and cleanup never leave the machine.',
    tags: ['Python', 'Rust', 'Tauri', 'faster-whisper', 'Ollama'],
  },
  {
    slug: 'growth-assistant',
    title: 'Lenny Growth Assistant',
    label: 'Grounded RAG',
    desc: 'Research assistant over Lenny’s Podcast. Every factual sentence cites the episode, guest and timestamp — or it says the transcripts don’t cover it.',
    tags: ['Python', 'pgvector', 'Claude', 'Ollama'],
  },
  {
    slug: 'exam-cracker',
    title: 'Competitive-Exam Cracker',
    label: 'Ingestion pipeline',
    desc: 'A 12-stage pipeline that reads an exam book as structured questions, not text chunks — feeding semantic search, adaptive practice and a tutor.',
    tags: ['FastAPI', 'Next.js', 'Qdrant', 'BGE-M3', 'Claude'],
  },
  {
    slug: 'job-agent',
    title: 'Autonomous Job Agent',
    label: 'Browser automation',
    desc: 'Reads a job description, tailors the résumé with an LLM, compiles LaTeX to PDF and applies — end to end, from a single dashboard.',
    tags: ['Next.js', 'Claude', 'Supabase', 'Playwright'],
  },
];

const toolkit = [
  ['Agents & LLMs', ['Claude', 'Gemini Live', 'Ollama', 'LangChain', 'Cognee']],
  ['Voice', ['SnapServe', 'faster-whisper', 'Silero VAD', 'Speech-to-speech']],
  ['Retrieval', ['pgvector', 'Qdrant', 'BGE-M3', 'Hybrid search + rerank', 'MongoDB']],
  ['Product', ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion']],
  ['Backend', ['Python', 'FastAPI', 'Node.js', 'Supabase', 'Postgres', 'Rust']],
  ['Automation', ['n8n', 'Playwright', 'Edge Functions', 'Docker']],
];

const themes = {
  dark: {
    bg: '#0B0D11', panel: '#0F1218', border: '#232832', grid: '#2A303A',
    text: '#ECEEF1', muted: '#9097A1', faint: '#6B727D',
    accent: '#FF7A45', accentSoft: '#FFC0A0', pill: '#161A21', pillText: '#C3C8CF', glow: 0.2,
  },
  light: {
    bg: '#FBFAF7', panel: '#FFFFFF', border: '#E5E2DA', grid: '#DDD9CF',
    text: '#16181D', muted: '#5C626C', faint: '#868C95',
    accent: '#D14D0A', accentSoft: '#F8B48C', pill: '#F5F3EE', pillText: '#41464F', glow: 0.1,
  },
};

// ─── primitives ───────────────────────────────────────────────────────────────

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontDir = join(root, 'scripts', 'fonts');
const metrics = JSON.parse(readFileSync(join(fontDir, 'metrics.json'), 'utf8'));
const b64 = (f) => readFileSync(join(fontDir, f)).toString('base64');

// Fonts are embedded because an SVG shown through <img> can't load external files.
const FONTS =
  `@font-face{font-family:G;font-weight:100 900;src:url(data:font/woff2;base64,${b64('geist.woff2')}) format('woff2')}` +
  `@font-face{font-family:GM;font-weight:100 900;src:url(data:font/woff2;base64,${b64('geist-mono.woff2')}) format('woff2')}` +
  `.s{font-family:G,'Segoe UI',-apple-system,Helvetica,Arial,sans-serif}` +
  `.m{font-family:GM,ui-monospace,SFMono-Regular,Consolas,monospace}`;

const MOTION =
  `.b{transform-box:fill-box;transform-origin:center;animation:w 1.4s ease-in-out infinite alternate}` +
  `@keyframes w{from{transform:scaleY(.3)}to{transform:scaleY(1)}}` +
  `.c{animation:c 1.1s step-end infinite}@keyframes c{50%{opacity:0}}` +
  `.p{transform-box:fill-box;transform-origin:center;animation:p 2s ease-out infinite}` +
  `@keyframes p{from{transform:scale(1);opacity:.55}to{transform:scale(3.2);opacity:0}}` +
  `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function measure(str, size, { mono = false, weight = 400, ls = 0 } = {}) {
  const table = metrics[mono ? 'mono' : 'sans'];
  const m = table[String(weight)] ?? table['400'];
  let w = 0;
  for (const ch of str) w += m[ch] ?? 0.6;
  return w * size + ls * [...str].length;
}

function wrap(str, size, max, opts) {
  const lines = [];
  let cur = '';
  for (const word of str.split(' ')) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && measure(next, size, opts) > max) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function text(x, y, str, { size, weight = 400, fill, mono = false, ls = 0, anchor, raw = false, cls = '' }) {
  const attrs = [
    `x="${x}"`, `y="${y}"`, `class="${mono ? 'm' : 's'}${cls ? ` ${cls}` : ''}"`,
    `font-size="${size}"`, `font-weight="${weight}"`, fill && `fill="${fill}"`,
    ls && `letter-spacing="${ls}"`, anchor && `text-anchor="${anchor}"`,
  ].filter(Boolean);
  return `<text ${attrs.join(' ')}>${raw ? str : esc(str)}</text>`;
}

// A rounded pill sized to its label; returns its width so callers can lay out rows.
function pill(x, y, label, o) {
  const { h, size, pad, padL = pad, mono = false, weight = 500, ls = 0, fill, fillOpacity, stroke, strokeOpacity, color } = o;
  const w = Math.round(measure(label, size, { mono, weight, ls }) + pad + padL);
  const rect =
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"` +
    (fillOpacity != null ? ` fill-opacity="${fillOpacity}"` : '') +
    (stroke ? ` stroke="${stroke}"` : '') +
    (strokeOpacity != null ? ` stroke-opacity="${strokeOpacity}"` : '') + '/>';
  const baseline = +(y + h / 2 + size * 0.355).toFixed(1);
  return { w, svg: rect + text(x + padL, baseline, label, { size, weight, mono, ls, fill: color }) };
}

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function waveform({ n, x0, x1, cy, bw, hmax, seed, fill, fade = false, minH = 6 }) {
  const rand = rng(seed);
  const gap = (x1 - x0 - n * bw) / (n - 1);
  let out = '';
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    const env = 0.16 + 0.84 * Math.sin(Math.PI * p) ** 1.4;
    const h = Math.max(minH, hmax * env * (0.45 + 0.55 * rand()));
    const x = x0 + i * (bw + gap);
    const dur = (0.9 + rand() * 1.2).toFixed(2);
    const delay = (-rand() * 2).toFixed(2);
    const op = fade ? Math.max(0.12, 1 - Math.abs(p - 0.5) * 1.9).toFixed(2) : null;
    out +=
      `<rect class="b" x="${x.toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" ` +
      `rx="${bw / 2}" fill="${fill}"${op ? ` opacity="${op}"` : ''} ` +
      `style="animation-duration:${dur}s;animation-delay:${delay}s"/>`;
  }
  return out;
}

const svg = (w, h, title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ` +
  `role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>` +
  `<style>${FONTS}${MOTION}</style>${body}</svg>\n`;

const arrow = (x, y, size, stroke) =>
  `<path d="M${x} ${y + size}L${x + size} ${y}M${x + size * 0.3} ${y}H${x + size}V${y + size * 0.7}" ` +
  `fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;

// ─── header ───────────────────────────────────────────────────────────────────

function header(t) {
  const W = 1200, H = 424, P = 64;

  const status = profile.status.toUpperCase();
  // Extra left padding leaves room for the pulsing dot.
  const statusSvg = pill(P, 56, status, {
    h: 34, size: 13.5, pad: 15, padL: 36, mono: true, ls: 1.2, fill: t.pill, stroke: t.border, color: t.muted,
  }).svg;

  const tagLines = wrap(profile.tagline, 21, 640);
  const last = tagLines.at(-1);
  const tagY = (i) => 298 + i * 32;
  const caretX = P + measure(last, 21) + 6;

  const readout = profile.readout
    .map((w, i) => `${i ? `<tspan dx="26"> </tspan>` : ''}<tspan fill="${t.accent}">${String(i + 1).padStart(2, '0')}</tspan> ${esc(w.toUpperCase())}`)
    .join('');

  const body = `
<defs>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${t.grid}"/></pattern>
  <radialGradient id="fade" cx=".78" cy=".45" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="dm"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  <radialGradient id="glow" cx=".8" cy=".48" r=".42"><stop offset="0" stop-color="${t.accent}" stop-opacity="${t.glow}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.accentSoft}"/><stop offset=".5" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accentSoft}"/></linearGradient>
  <clipPath id="clip"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="23"/></clipPath>
</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="${t.bg}" stroke="${t.border}"/>
<g clip-path="url(#clip)">
  <rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#dm)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
</g>
${statusSvg}
<circle cx="${P + 19}" cy="73" r="4" fill="${t.accent}"/>
<circle class="p" cx="${P + 19}" cy="73" r="4" fill="${t.accent}"/>
${text(P - 4, 190, profile.name, { size: 92, weight: 600, fill: t.text, ls: -3.6 })}
${text(P, 246, profile.role, { size: 28, weight: 500, fill: t.text, ls: -0.4 })}
${tagLines.map((l, i) => text(P, tagY(i), l, { size: 21, fill: t.muted })).join('\n')}
<rect class="c" x="${caretX.toFixed(1)}" y="${tagY(tagLines.length - 1) - 17}" width="10" height="22" rx="1.5" fill="${t.accent}"/>
<line x1="812" y1="206" x2="1136" y2="206" stroke="${t.border}"/>
${waveform({ n: 38, x0: 812, x1: 1136, cy: 206, bw: 5, hmax: 172, seed: 11, fill: 'url(#bar)' })}
<line x1="${P}" y1="356" x2="${W - P}" y2="356" stroke="${t.border}"/>
${text(P, 390, readout, { size: 14, weight: 500, mono: true, ls: 1.4, fill: t.faint, raw: true })}
${text(W - P - 22, 390, profile.site.toUpperCase(), { size: 14, weight: 500, mono: true, ls: 1.4, fill: t.faint, anchor: 'end' })}
${arrow(W - P - 11, 380, 11, t.faint)}`;

  return svg(W, H, `${profile.name} — ${profile.role}`, body);
}

// ─── project card ─────────────────────────────────────────────────────────────

function card(p, i, t) {
  const W = 560, H = 300, P = 32, maxW = W - P * 2;

  const lines = wrap(p.desc, 17, maxW);
  if (lines.length > 3) console.warn(`! ${p.slug}: description wraps to ${lines.length} lines — shorten it`);

  let badge = '';
  if (p.badge) {
    const label = p.badge.toUpperCase();
    const o = { h: 26, size: 11.5, pad: 11, mono: true, weight: 600, ls: 1 };
    const w = Math.round(measure(label, o.size, o) + o.pad * 2);
    badge = pill(W - P - 28 - w, 32, label, {
      ...o, fill: t.accent, fillOpacity: 0.1, stroke: t.accent, strokeOpacity: 0.45, color: t.accent,
    }).svg;
  }

  let x = P, tags = '';
  for (const tag of p.tags) {
    const o = { h: 30, size: 14, pad: 13, weight: 500, fill: t.pill, stroke: t.border, color: t.pillText };
    const w = Math.round(measure(tag, o.size, o) + o.pad * 2);
    if (x + w > W - P) {
      console.warn(`! ${p.slug}: dropped tag "${tag}" — row is full`);
      break;
    }
    tags += pill(x, H - P - 30, tag, o).svg;
    x += w + 8;
  }

  const label =
    `<tspan fill="${t.accent}">${String(i + 1).padStart(2, '0')}</tspan>` +
    `<tspan fill="${t.faint}">  /  </tspan>${esc(p.label.toUpperCase())}`;

  const body = `
<defs>
  <radialGradient id="g" cx="1" cy="0" r=".9"><stop offset="0" stop-color="${t.accent}" stop-opacity="${t.glow * 0.7}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <clipPath id="clip"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17"/></clipPath>
</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.panel}" stroke="${t.border}"/>
<rect width="${W}" height="${H}" fill="url(#g)" clip-path="url(#clip)"/>
${text(P, 50, label, { size: 12.5, weight: 500, mono: true, ls: 1.2, fill: t.muted, raw: true })}
${badge}
${arrow(W - P - 12, 38, 12, t.muted)}
${text(P, 106, p.title, { size: 30, weight: 600, fill: t.text, ls: -0.6 })}
${lines.map((l, k) => text(P, 150 + k * 27, l, { size: 17, fill: t.muted })).join('\n')}
${tags}`;

  return svg(W, H, `${p.title} — ${p.desc}`, body);
}

// ─── toolkit ──────────────────────────────────────────────────────────────────

function stack(t) {
  const W = 920, P = 40, rowH = 60, top = 22, pillX = 240;
  const H = top * 2 + toolkit.length * rowH;

  let rows = '';
  toolkit.forEach(([group, items], r) => {
    const y0 = top + r * rowH, cy = y0 + rowH / 2;
    if (r) rows += `<line x1="${P}" y1="${y0}" x2="${W - P}" y2="${y0}" stroke="${t.border}" stroke-dasharray="2 5"/>`;
    rows += text(P, cy + 4.6, `<tspan fill="${t.accent}">${String(r + 1).padStart(2, '0')}</tspan>  ${esc(group.toUpperCase())}`, {
      size: 13, weight: 500, mono: true, ls: 1.5, fill: t.muted, raw: true,
    });
    let x = pillX;
    for (const item of items) {
      const pl = pill(x, cy - 17, item, { h: 34, size: 16, pad: 16, fill: t.pill, stroke: t.border, color: t.pillText });
      if (x + pl.w > W - P) console.warn(`! toolkit row "${group}" overflows`);
      rows += pl.svg;
      x += pl.w + 10;
    }
  });

  const body = `
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="${t.panel}" stroke="${t.border}"/>
${rows}`;
  return svg(W, H, `Toolkit — ${toolkit.map(([g, i]) => `${g}: ${i.join(', ')}`).join('; ')}`, body);
}

// ─── footer ───────────────────────────────────────────────────────────────────

function footer(t) {
  const W = 900, H = 140;
  const body = `
${waveform({ n: 72, x0: 200, x1: 700, cy: 46, bw: 3, hmax: 40, seed: 5, fill: t.accent, fade: true, minH: 3 })}
${text(W / 2, 112, profile.signoff.toUpperCase(), { size: 12.5, weight: 500, mono: true, ls: 2.4, fill: t.faint, anchor: 'middle' })}`;
  return svg(W, H, profile.signoff, body);
}

// ─── write ────────────────────────────────────────────────────────────────────

const outDir = join(root, 'assets');
mkdirSync(outDir, { recursive: true });
let count = 0;
const write = (name, content) => {
  writeFileSync(join(outDir, name), content);
  count++;
};

for (const [mode, t] of Object.entries(themes)) {
  write(`header-${mode}.svg`, header(t));
  write(`toolkit-${mode}.svg`, stack(t));
  write(`footer-${mode}.svg`, footer(t));
  projects.forEach((p, i) => write(`card-${p.slug}-${mode}.svg`, card(p, i, t)));
}
console.log(`wrote ${count} files to assets/`);
