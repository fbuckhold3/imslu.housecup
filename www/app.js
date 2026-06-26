// Asset version. Bump this AND the `?v=` query on the app.js <script> tag in
// index.html together whenever this file changes, so returning browsers fetch
// the new bundle instead of a cached one. Readable at window.__HC_VER__ to
// confirm which build is live.
window.__HC_VER__ = 7;
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* -----------------------------------------
   HOUSE DEFINITIONS + LOGOS
----------------------------------------- */

/* Engraving-style anatomical logos — line art with cross-hatching on parchment */

const WaldenLogo = ({ color }) => (
  // Anatomical heart — Walden
  <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
    {/* Heart outline — asymmetric, apex pointing down-left */}
    <path d="M30 10 Q20 6 14 14 Q8 24 12 34 Q16 46 28 54 L32 58 L35 50 Q44 46 50 36 Q55 26 50 16 Q44 8 36 10 Q32 11 30 10 Z"
          fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    {/* Great vessels — SVC + aortic arch */}
    <path d="M28 10 Q26 4 22 3" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M33 10 Q33 3 38 2 Q44 2 42 8" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    {/* Interventricular groove */}
    <path d="M30 18 Q27 30 26 42 Q26 48 28 52" fill="none" stroke={color} strokeWidth="0.9" opacity="0.75"/>
    {/* Coronary branching */}
    <path d="M22 20 Q26 26 30 28 M20 28 Q26 32 30 32" fill="none" stroke={color} strokeWidth="0.7" opacity="0.6"/>
    {/* Cross-hatch shading — right side */}
    <path d="M38 20 L42 24 M40 28 L44 32 M40 34 L43 38 M38 40 L41 44" stroke={color} strokeWidth="0.6" opacity="0.5"/>
    {/* Cross-hatch shading — left side */}
    <path d="M18 22 L16 26 M16 30 L14 34 M16 38 L14 42" stroke={color} strokeWidth="0.6" opacity="0.45"/>
  </svg>
);

const FitchLogo = ({ color }) => (
  // Anatomical brain (superior view with cerebellum) — Fitch
  <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
    {/* Brain outline — oval, slight frontal narrowing */}
    <path d="M32 6 Q18 7 13 18 Q9 28 12 40 Q16 50 32 54 Q48 50 52 40 Q55 28 51 18 Q46 7 32 6 Z"
          fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Central longitudinal fissure */}
    <path d="M32 7 Q31 14 32 22 Q33 30 32 38 Q31 46 32 53" fill="none" stroke={color} strokeWidth="1.2"/>
    {/* Gyri — left hemisphere */}
    <path d="M20 13 Q23 16 20 20" fill="none" stroke={color} strokeWidth="0.9"/>
    <path d="M16 20 Q22 22 18 26" fill="none" stroke={color} strokeWidth="0.9"/>
    <path d="M14 28 Q22 30 16 34" fill="none" stroke={color} strokeWidth="0.9"/>
    <path d="M15 38 Q22 38 18 42" fill="none" stroke={color} strokeWidth="0.9"/>
    <path d="M20 46 Q26 46 22 50" fill="none" stroke={color} strokeWidth="0.9"/>
    {/* Gyri — right hemisphere (mirror) */}
    <path d="M44 13 Q41 16 44 20" fill="none" stroke={color} strokeWidth="0.9"/>
    <path d="M48 20 Q42 22 46 26" fill="none" stroke={color} strokeWidth="0.9"/>
    <path d="M50 28 Q42 30 48 34" fill="none" stroke={color} strokeWidth="0.9"/>
    <path d="M49 38 Q42 38 46 42" fill="none" stroke={color} strokeWidth="0.9"/>
    <path d="M44 46 Q38 46 42 50" fill="none" stroke={color} strokeWidth="0.9"/>
    {/* Cerebellum peeking out at occiput */}
    <path d="M26 52 Q28 60 32 60 Q36 60 38 52" fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    <line x1="29" y1="56" x2="35" y2="56" stroke={color} strokeWidth="0.5" opacity="0.65"/>
    <line x1="30" y1="58" x2="34" y2="58" stroke={color} strokeWidth="0.5" opacity="0.65"/>
  </svg>
);

const DrakeLogo = ({ color }) => (
  // Anatomical kidney (bean with hilum + vessels) — Drake
  <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
    {/* Kidney outline */}
    <path d="M42 8 Q54 10 56 24 Q57 38 50 48 Q40 56 30 54 Q22 56 16 50 Q10 44 8 32 Q7 18 18 10 Q28 6 42 8 Z"
          fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Hilum — concave dip on medial (left) side */}
    <path d="M18 28 Q10 30 12 36 Q14 40 18 38" fill="none" stroke={color} strokeWidth="1.2"/>
    {/* Renal artery emerging */}
    <path d="M14 30 Q8 28 3 32" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round"/>
    {/* Renal vein */}
    <path d="M14 34 Q6 36 3 40" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round"/>
    {/* Ureter descending */}
    <path d="M16 40 Q14 48 18 54 Q20 58 22 62" fill="none" stroke={color} strokeWidth="1.1"/>
    {/* Cortex/medulla boundary — interior curve */}
    <path d="M38 14 Q48 20 48 32 Q48 42 36 48" fill="none" stroke={color} strokeWidth="0.8" opacity="0.65"/>
    {/* Medullary pyramids — faint triangles */}
    <path d="M28 16 L26 22 L32 22 Z M38 20 L36 26 L42 26 Z M34 32 L32 38 L38 38 Z M26 38 L24 44 L30 44 Z"
          fill="none" stroke={color} strokeWidth="0.6" opacity="0.5"/>
    {/* Cross-hatching — lateral edge */}
    <path d="M46 16 L50 20 M48 24 L52 28 M48 32 L52 36 M44 40 L48 44" stroke={color} strokeWidth="0.55" opacity="0.5"/>
  </svg>
);

const SlavinLogo = ({ color }) => (
  // Anatomical lungs (trachea, bronchi, bilateral lungs with fissures) — Slavin
  <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
    {/* Trachea */}
    <path d="M29 4 L29 18 L35 18 L35 4 Z" fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    {/* Tracheal cartilage rings */}
    <line x1="29" y1="7"  x2="35" y2="7"  stroke={color} strokeWidth="0.6"/>
    <line x1="29" y1="10" x2="35" y2="10" stroke={color} strokeWidth="0.6"/>
    <line x1="29" y1="13" x2="35" y2="13" stroke={color} strokeWidth="0.6"/>
    <line x1="29" y1="16" x2="35" y2="16" stroke={color} strokeWidth="0.6"/>
    {/* Carina + main bronchi */}
    <path d="M32 18 Q24 22 18 28" fill="none" stroke={color} strokeWidth="1.2"/>
    <path d="M32 18 Q40 22 46 28" fill="none" stroke={color} strokeWidth="1.2"/>
    {/* Left lung (2 lobes — smaller, with cardiac notch) */}
    <path d="M18 26 Q10 32 10 44 Q12 56 22 57 Q28 55 28 46 L28 30 Q28 24 26 24 Q22 24 18 26 Z"
          fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Left oblique fissure */}
    <path d="M28 36 Q20 38 12 44" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
    {/* Right lung (3 lobes — larger) */}
    <path d="M46 26 Q54 32 54 44 Q52 56 42 57 Q36 55 36 46 L36 30 Q36 24 38 24 Q42 24 46 26 Z"
          fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Right horizontal fissure */}
    <path d="M36 32 Q44 32 52 36" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
    {/* Right oblique fissure */}
    <path d="M36 42 Q44 43 54 44" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
    {/* Bronchial tree — left */}
    <path d="M22 30 L20 38 M24 32 L26 40 M22 36 L18 44" stroke={color} strokeWidth="0.5" opacity="0.55"/>
    {/* Bronchial tree — right */}
    <path d="M42 30 L44 38 M40 32 L38 40 M42 36 L46 44" stroke={color} strokeWidth="0.5" opacity="0.55"/>
  </svg>
);

const KinsellaLogo = ({ color }) => (
  // White blood cell (neutrophil with multilobed nucleus + granules) — Kinsella
  <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
    {/* Cell membrane */}
    <circle cx="32" cy="32" r="24" fill="none" stroke={color} strokeWidth="1.5"/>
    {/* Inner membrane hint for depth */}
    <circle cx="32" cy="32" r="22.2" fill="none" stroke={color} strokeWidth="0.4" opacity="0.5"/>
    {/* Multi-lobed nucleus — 4 lobes joined by chromatin bridges */}
    <ellipse cx="22" cy="22" rx="7"   ry="6"   fill={color} fillOpacity="0.22" stroke={color} strokeWidth="1.2"/>
    <ellipse cx="42" cy="22" rx="6"   ry="5"   fill={color} fillOpacity="0.22" stroke={color} strokeWidth="1.2"/>
    <ellipse cx="44" cy="40" rx="6"   ry="6"   fill={color} fillOpacity="0.22" stroke={color} strokeWidth="1.2"/>
    <ellipse cx="24" cy="42" rx="6.5" ry="5"   fill={color} fillOpacity="0.22" stroke={color} strokeWidth="1.2"/>
    {/* Chromatin bridges */}
    <path d="M29 22 Q32 20 36 22"  fill="none" stroke={color} strokeWidth="1.4"/>
    <path d="M44 28 Q46 34 44 35"  fill="none" stroke={color} strokeWidth="1.4"/>
    <path d="M38 42 Q32 43 30 42"  fill="none" stroke={color} strokeWidth="1.4"/>
    <path d="M22 37 Q20 32 22 28"  fill="none" stroke={color} strokeWidth="1.4"/>
    {/* Heterochromatin stippling inside nuclear lobes */}
    <circle cx="20" cy="20" r="0.7" fill={color}/>
    <circle cx="24" cy="24" r="0.6" fill={color}/>
    <circle cx="40" cy="20" r="0.6" fill={color}/>
    <circle cx="43" cy="24" r="0.7" fill={color}/>
    <circle cx="42" cy="38" r="0.6" fill={color}/>
    <circle cx="46" cy="42" r="0.7" fill={color}/>
    <circle cx="22" cy="41" r="0.7" fill={color}/>
    <circle cx="26" cy="44" r="0.6" fill={color}/>
    {/* Cytoplasmic granules */}
    <circle cx="32" cy="12" r="0.9" fill={color} opacity="0.7"/>
    <circle cx="14" cy="32" r="0.9" fill={color} opacity="0.7"/>
    <circle cx="50" cy="32" r="0.9" fill={color} opacity="0.7"/>
    <circle cx="32" cy="52" r="0.9" fill={color} opacity="0.7"/>
    <circle cx="32" cy="32" r="0.7" fill={color} opacity="0.55"/>
    <circle cx="17" cy="18" r="0.6" fill={color} opacity="0.6"/>
    <circle cx="48" cy="17" r="0.6" fill={color} opacity="0.6"/>
    <circle cx="16" cy="48" r="0.6" fill={color} opacity="0.6"/>
    <circle cx="49" cy="48" r="0.6" fill={color} opacity="0.6"/>
  </svg>
);

const HOUSES = [
  {
    id: 'walden',
    name: 'Walden',
    altName: 'Valor',
    color: '#1e3c5a',        // Prussian blue — anatomical veins
    colorSoft: '#5a7a99',
    glow: 'rgba(30, 60, 90, 0.45)',
    tag: 'Bravery · Resolve',
    Logo: WaldenLogo,
  },
  {
    id: 'fitch',
    name: 'Fitch',
    altName: 'Honor',
    color: '#9c2b22',        // Oxblood / vermillion
    colorSoft: '#c66a5e',
    glow: 'rgba(156, 43, 34, 0.40)',
    tag: 'Virtue · Duty',
    Logo: FitchLogo,
  },
  {
    id: 'drake',
    name: 'Drake',
    altName: 'Liberty',
    color: '#3f6b36',        // Verdigris / muted forest
    colorSoft: '#7a9669',
    glow: 'rgba(63, 107, 54, 0.45)',
    tag: 'Freedom · Fire',
    Logo: DrakeLogo,
  },
  {
    id: 'slavin',
    name: 'Slavin',
    altName: 'Eagle',
    color: '#a67521',        // Aged ochre / mustard
    colorSoft: '#d4a24d',
    glow: 'rgba(166, 117, 33, 0.45)',
    tag: 'Vision · Vigilance',
    Logo: SlavinLogo,
  },
  {
    id: 'kinsella',
    name: 'Kinsella',
    altName: 'Freedom',
    color: '#5e3564',        // Aubergine / muted plum
    colorSoft: '#8e6294',
    glow: 'rgba(94, 53, 100, 0.45)',
    tag: 'Spirit · Light',
    Logo: KinsellaLogo,
  },
];

const MAX_POINTS = 10000;

/* -----------------------------------------
   HOURGLASS BEAD GEOMETRY
   Two quadratic beziers per side (upper/lower bulb).
   halfWidth(y) is derived from the same bezier used
   for the SVG glass path.
----------------------------------------- */

const HG = {
  vbW: 200,           // viewBox width
  vbH: 500,           // viewBox height
  padX: 8,            // horizontal padding inside glass
  padY: 10,           // vertical padding inside glass
  neckRatio: 0.14,    // neck half-width / max half-width
  beadR: 1.15,        // bead radius in viewBox units
  beadGap: 0.25,      // extra spacing between beads
};

function hourglassPath() {
  const { vbW, vbH, padX, padY, neckRatio } = HG;
  const cx = vbW / 2;
  const wMax = (vbW - 2 * padX) / 2;
  const wNeck = wMax * neckRatio;
  const yTop = padY;
  const yMid = vbH / 2;
  const yBot = vbH - padY;

  // Path — outer glass shape (symmetric)
  // Top edge lip + upper bulb -> neck -> lower bulb + base lip
  return [
    `M ${cx - wMax} ${yTop}`,
    // upper-left: quadratic to neck-left, control pulled outward (wMax, halfway)
    `Q ${cx - wMax} ${(yTop + yMid) / 2} ${cx - wNeck} ${yMid}`,
    // lower-left: neck -> bottom-left, control at (wMax, halfway)
    `Q ${cx - wMax} ${(yMid + yBot) / 2} ${cx - wMax} ${yBot}`,
    // bottom base
    `L ${cx + wMax} ${yBot}`,
    // lower-right
    `Q ${cx + wMax} ${(yMid + yBot) / 2} ${cx + wNeck} ${yMid}`,
    // upper-right
    `Q ${cx + wMax} ${(yTop + yMid) / 2} ${cx + wMax} ${yTop}`,
    'Z',
  ].join(' ');
}

// Interior "usable" half-width, allowing a small margin so beads sit within glass
function interiorHalfWidth(y, inset = 2.5) {
  const { vbW, vbH, padX, padY, neckRatio } = HG;
  const yTop = padY;
  const yMid = vbH / 2;
  const yBot = vbH - padY;
  if (y < yTop || y > yBot) return 0;
  const wMax = (vbW - 2 * padX) / 2 - inset;
  const wNeck = (wMax + inset) * neckRatio - inset * 0.3;

  // Quadratic bezier with P0=wMax, P1=wMax, P2=wNeck (upper) and mirror (lower)
  // y linear in t because control-y = (y0 + y2) / 2.
  if (y <= yMid) {
    const t = (y - yTop) / (yMid - yTop);
    const omt = 1 - t;
    // P0 = wMax, P1 = wMax, P2 = wNeck  -> (1-t)^2 wMax + 2(1-t)t wMax + t^2 wNeck
    return omt * omt * wMax + 2 * omt * t * wMax + t * t * Math.max(wNeck, 2);
  } else {
    const t = (y - yMid) / (yBot - yMid);
    const omt = 1 - t;
    // P0 = wNeck, P1 = wMax, P2 = wMax
    return omt * omt * Math.max(wNeck, 2) + 2 * omt * t * wMax + t * t * wMax;
  }
}

function computeBeadPositions() {
  const { vbW, vbH, padY, beadR, beadGap } = HG;
  const cx = vbW / 2;
  const step = beadR * 2 + beadGap;     // horizontal step
  const rowH = step * Math.sqrt(3) / 2; // hex row spacing
  const yStart = vbH - padY - beadR - 0.5; // start near bottom
  const yEnd = padY + beadR + 0.5;

  const positions = [];
  let row = 0;
  // Walk upward from bottom so positions[] is indexed bottom-first
  for (let y = yStart; y >= yEnd; y -= rowH) {
    const halfW = interiorHalfWidth(y);
    if (halfW < beadR) { row++; continue; }
    const offset = (row % 2) * (step / 2);
    // Number of beads that fit horizontally
    const innerW = halfW * 2 - beadR; // small margin
    const n = Math.max(0, Math.floor((innerW - offset) / step) + 1);
    if (n <= 0) { row++; continue; }
    const totalW = (n - 1) * step;
    const startX = cx - totalW / 2;
    for (let i = 0; i < n; i++) {
      positions.push({ x: startX + i * step, y });
    }
    row++;
  }
  return positions;
}

const BEAD_POSITIONS = computeBeadPositions();
const BEAD_CAPACITY = Math.min(BEAD_POSITIONS.length, MAX_POINTS);

/* -----------------------------------------
   HOURGLASS COMPONENT
----------------------------------------- */

function Hourglass({ points, color, colorSoft, houseId, pulsing }) {
  const path = useMemo(() => hourglassPath(), []);
  const filled = Math.max(0, Math.min(points, BEAD_CAPACITY));

  const filledIds = `fillGrad-${houseId}`;
  const glassIds  = `glassGrad-${houseId}`;
  const woodIds   = `woodGrad-${houseId}`;
  const INK = '#2a1a11';

  return (
    <svg
      viewBox={`0 0 ${HG.vbW} ${HG.vbH}`}
      className="hourglass-svg"
      preserveAspectRatio="xMidYMid meet"
      aria-label={`${houseId} hourglass`}
    >
      <defs>
        {/* Warm glass tint */}
        <linearGradient id={glassIds} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"   stopColor="rgba(245, 234, 208, 0.85)" />
          <stop offset="0.5" stopColor="rgba(228, 210, 170, 0.55)" />
          <stop offset="1"   stopColor="rgba(245, 234, 208, 0.80)" />
        </linearGradient>
        {/* House-color fill for beads */}
        <linearGradient id={filledIds} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colorSoft} stopOpacity="1"/>
          <stop offset="1" stopColor={color}     stopOpacity="1"/>
        </linearGradient>
        {/* Wood grain for end caps */}
        <linearGradient id={woodIds} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"   stopColor="#6b4423" />
          <stop offset="0.5" stopColor="#8b5a30" />
          <stop offset="1"   stopColor="#5a3818" />
        </linearGradient>
      </defs>

      {/* Inside-glass warm tint */}
      <path d={path} fill={`url(#${glassIds})`} />

      {/* Ghost beads (upper, above fill level) — faint ink dots */}
      <g fill={color} fillOpacity="0.14">
        {BEAD_POSITIONS.map((p, i) => (
          i >= filled ? (
            <circle
              key={`g${i}`}
              cx={p.x}
              cy={p.y}
              r={HG.beadR * 0.7}
            />
          ) : null
        ))}
      </g>

      {/* Filled beads (bottom-up) */}
      <g fill={`url(#${filledIds})`}>
        {BEAD_POSITIONS.map((p, i) => (
          i < filled ? (
            <circle
              key={`f${i}`}
              cx={p.x}
              cy={p.y}
              r={HG.beadR}
            />
          ) : null
        ))}
      </g>

      {/* Glass outline — dark ink, engraving style */}
      <path d={path}
            fill="none"
            stroke={INK}
            strokeOpacity="0.85"
            strokeWidth="1.8"
            strokeLinejoin="round"/>
      {/* Inner highlight */}
      <path d={path}
            fill="none"
            stroke="rgba(255, 248, 220, 0.55)"
            strokeWidth="0.5"
            transform={`translate(1 1)`}/>

      {/* Wooden end caps */}
      <g>
        {/* Top cap */}
        <rect x={HG.padX - 10} y={HG.padY - 12} width={HG.vbW - 2*HG.padX + 20} height="12"
              fill={`url(#${woodIds})`} stroke={INK} strokeWidth="1.4" rx="1"/>
        {/* Top cap grain lines */}
        <line x1={HG.padX - 6} y1={HG.padY - 9} x2={HG.vbW - HG.padX + 6} y2={HG.padY - 9} stroke={INK} strokeOpacity="0.35" strokeWidth="0.5"/>
        <line x1={HG.padX - 6} y1={HG.padY - 5} x2={HG.vbW - HG.padX + 6} y2={HG.padY - 5} stroke={INK} strokeOpacity="0.25" strokeWidth="0.5"/>
        {/* Top cap highlight */}
        <rect x={HG.padX - 10} y={HG.padY - 12} width={HG.vbW - 2*HG.padX + 20} height="2"
              fill="rgba(255, 220, 170, 0.45)" rx="1"/>

        {/* Bottom cap */}
        <rect x={HG.padX - 10} y={HG.vbH - HG.padY} width={HG.vbW - 2*HG.padX + 20} height="12"
              fill={`url(#${woodIds})`} stroke={INK} strokeWidth="1.4" rx="1"/>
        <line x1={HG.padX - 6} y1={HG.vbH - HG.padY + 3} x2={HG.vbW - HG.padX + 6} y2={HG.vbH - HG.padY + 3} stroke={INK} strokeOpacity="0.35" strokeWidth="0.5"/>
        <line x1={HG.padX - 6} y1={HG.vbH - HG.padY + 7} x2={HG.vbW - HG.padX + 6} y2={HG.vbH - HG.padY + 7} stroke={INK} strokeOpacity="0.25" strokeWidth="0.5"/>
        <rect x={HG.padX - 10} y={HG.vbH - HG.padY} width={HG.vbW - 2*HG.padX + 20} height="2"
              fill="rgba(255, 220, 170, 0.4)" rx="1"/>
      </g>

      {/* Brass band at neck */}
      <g>
        <rect x={HG.vbW / 2 - 18} y={HG.vbH / 2 - 3} width="36" height="6"
              fill="#a67521" stroke={INK} strokeWidth="1" rx="0.5"/>
        <rect x={HG.vbW / 2 - 18} y={HG.vbH / 2 - 3} width="36" height="1.2"
              fill="rgba(255, 230, 170, 0.7)"/>
        <line x1={HG.vbW / 2 - 14} y1={HG.vbH / 2 - 3} x2={HG.vbW / 2 - 14} y2={HG.vbH / 2 + 3} stroke={INK} strokeOpacity="0.35" strokeWidth="0.5"/>
        <line x1={HG.vbW / 2 + 14} y1={HG.vbH / 2 - 3} x2={HG.vbW / 2 + 14} y2={HG.vbH / 2 + 3} stroke={INK} strokeOpacity="0.35" strokeWidth="0.5"/>
      </g>
    </svg>
  );
}

const MemoHourglass = React.memo(Hourglass);

/* -----------------------------------------
   COMMAND PARSING
----------------------------------------- */

function normalizeHouseMatch(text) {
  if (!text) return null;
  const t = text.toLowerCase().trim().replace(/\s+/g, ' ');
  // Direct match
  for (const h of HOUSES) {
    const needles = [h.name.toLowerCase(), h.altName.toLowerCase(), h.id];
    for (const n of needles) {
      const re = new RegExp(`\\b${n}\\b`);
      if (re.test(t)) return h;
    }
  }
  // Fuzzy: any token prefix (>=4 chars) match
  const tokens = t.split(/\W+/).filter(Boolean);
  for (const tk of tokens) {
    if (tk.length < 4) continue;
    for (const h of HOUSES) {
      const pool = [h.name.toLowerCase(), h.altName.toLowerCase(), h.id];
      for (const n of pool) {
        if (n.startsWith(tk) || tk.startsWith(n)) return h;
      }
    }
  }
  return null;
}

const WORD_NUMS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
};

// Parse "twenty five", "one hundred", "two hundred fifty" etc., falling back to digits.
function parseNumber(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase().replace(/,/g, '').trim();
  const digits = s.match(/-?\d+/);
  if (digits) return parseInt(digits[0], 10);

  const tokens = s.split(/\s+|-/).filter(Boolean);
  let total = 0, current = 0;
  let touched = false;
  for (const tk of tokens) {
    if (tk in WORD_NUMS) {
      const v = WORD_NUMS[tk];
      touched = true;
      if (v === 100) current = (current || 1) * 100;
      else if (v === 1000) { total += (current || 1) * 1000; current = 0; }
      else current += v;
    }
  }
  if (!touched) return null;
  return total + current;
}

function parseCommand(text) {
  if (!text) return { error: 'Empty command.' };
  const raw = text.trim();
  const low = raw.toLowerCase();

  // Pattern 1: "+100 walden" / "-50 fitch"
  const signed = low.match(/^([+\-])\s*(\d+)\s+(.+)$/);
  if (signed) {
    const sign = signed[1] === '-' ? -1 : 1;
    const n = parseInt(signed[2], 10);
    const h = normalizeHouseMatch(signed[3]);
    if (!h) return { error: `Couldn't find a house in "${signed[3]}".` };
    return { delta: sign * n, house: h };
  }

  // Pattern 2: "[n] points to/from [house]"
  const pts = low.match(/(-?\d+|[a-z\s-]+?)\s+points?\s+(to|from|for|on|into|into the|to the)\s+(.+)/);
  if (pts) {
    const n = parseNumber(pts[1]);
    if (n == null) return { error: `Couldn't parse the number in "${raw}".` };
    const dir = /from/.test(pts[2]) ? -1 : 1;
    const h = normalizeHouseMatch(pts[3]);
    if (!h) return { error: `Couldn't find a house in "${pts[3]}".` };
    return { delta: dir * Math.abs(n), house: h };
  }

  // Pattern 3: "add/give/award/grant [n] (points)? (to)? [house]"
  // Pattern 4: "remove/take/subtract/deduct/dock/minus [n] (points)? (from)? [house]"
  const verbPlus  = /^(add|give|award|grant|plus|give to|gift|bestow)\s+(.+)$/.exec(low);
  const verbMinus = /^(remove|take|subtract|deduct|dock|minus|lose)\s+(.+)$/.exec(low);
  const verbMatch = verbPlus || verbMinus;
  if (verbMatch) {
    const sign = verbPlus ? 1 : -1;
    const rest = verbMatch[2];
    // Pull a number (digits or words) + then the rest should identify the house
    const digitM = rest.match(/(-?\d+)\b/);
    let n = null, housePart = rest;
    if (digitM) {
      n = parseInt(digitM[1], 10);
      housePart = rest.replace(digitM[0], ' ');
    } else {
      // try word-based number at the beginning
      const tokens = rest.split(/\s+/);
      let i = 0;
      while (i < tokens.length && (tokens[i] in WORD_NUMS || tokens[i] === 'a' || tokens[i] === 'an')) i++;
      if (i > 0) {
        const numStr = tokens.slice(0, i).join(' ');
        n = parseNumber(numStr);
        housePart = tokens.slice(i).join(' ');
      }
    }
    if (n == null) return { error: `Couldn't parse the number in "${raw}".` };
    housePart = housePart.replace(/\b(points?|pts?|to|from|for|the)\b/g, ' ');
    const h = normalizeHouseMatch(housePart);
    if (!h) return { error: `Couldn't find a house in "${raw}".` };
    return { delta: sign * Math.abs(n), house: h };
  }

  // Pattern 5: "[house] +100" / "[house] plus 5" / "[house] -50"
  const houseThenSigned = low.match(/^(.+?)\s+([+\-])\s*(\d+)$/);
  if (houseThenSigned) {
    const h = normalizeHouseMatch(houseThenSigned[1]);
    if (!h) return { error: `Couldn't find a house in "${houseThenSigned[1]}".` };
    const sign = houseThenSigned[2] === '-' ? -1 : 1;
    return { delta: sign * parseInt(houseThenSigned[3], 10), house: h };
  }

  // Pattern 6: "[house] [+/-][n]" with plus/minus words
  const houseThenWord = low.match(/^(.+?)\s+(gains?|earns?|scores?|loses?)\s+(-?\d+|[a-z\s-]+)$/);
  if (houseThenWord) {
    const h = normalizeHouseMatch(houseThenWord[1]);
    if (!h) return { error: `Couldn't find a house in "${houseThenWord[1]}".` };
    const sign = /lose/.test(houseThenWord[2]) ? -1 : 1;
    const n = parseNumber(houseThenWord[3]);
    if (n == null) return { error: `Couldn't parse the number in "${raw}".` };
    return { delta: sign * Math.abs(n), house: h };
  }

  return { error: `Couldn't understand "${raw}". Try: 50 points to Walden.` };
}

/* -----------------------------------------
   STATE (server-backed via Shiny / REDCap)

   The front-end no longer persists to localStorage. The Shiny server
   (app.R) is the source of truth, computing totals + history from the
   REDCap "house_points" project. We:
     - start empty, then request authoritative state on connect
     - update optimistically on each award for snappy feedback
     - send each award to the server, which writes one REDCap row and
       echoes back the authoritative state (correcting any drift)
----------------------------------------- */

const defaultState = () => {
  const pts = {};
  HOUSES.forEach(h => { pts[h.id] = 0; });
  return { points: pts, history: [], acadYear: '' };
};

// Coerce a state object pushed from the server into the shape the UI expects.
function normalizeServerState(incoming) {
  const base = defaultState();
  if (incoming && typeof incoming === 'object') {
    if (incoming.points && typeof incoming.points === 'object') {
      HOUSES.forEach(h => {
        const v = parseInt(incoming.points[h.id], 10);
        base.points[h.id] = Number.isFinite(v) ? Math.max(0, Math.min(MAX_POINTS, v)) : 0;
      });
    }
    if (Array.isArray(incoming.history)) {
      base.history = incoming.history.slice(0, 50);
    }
    if (typeof incoming.acadYear === 'string') {
      base.acadYear = incoming.acadYear;
    }
  }
  return base;
}

const hasShiny = () => typeof window !== 'undefined' && window.Shiny;

/* -----------------------------------------
   SPEECH RECOGNITION (persistent instance)
----------------------------------------- */

function isIOS() {
  const ua = navigator.userAgent || '';
  const iOSDetected = /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && 'ontouchend' in document);
  return iOSDetected;
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  // iOS Safari exposes webkitSpeechRecognition but it's flaky and permission-prompty.
  // Treat iOS as unsupported so we fall back to text + buttons.
  if (isIOS()) return null;
  return SR;
}

/* -----------------------------------------
   ICONS
----------------------------------------- */

const MicIcon = ({ listening }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
    {listening && <circle cx="20" cy="5" r="2" fill="currentColor"/>}
  </svg>
);

/* -----------------------------------------
   HOUSE CARD
----------------------------------------- */

function HouseCard({ house, points, isLeader, pulsing, showQuick, onQuick, onToggleQuick, voiceAvailable }) {
  const { id, name, altName, color, colorSoft, tag, Logo } = house;
  const capacityPct = Math.min(100, (points / MAX_POINTS) * 100);

  return (
    <div
      className={`card ${isLeader ? 'leading' : ''} ${pulsing ? 'pulsing' : ''}`}
      style={{
        '--house-color': color,
        '--house-glow': house.glow,
        '--card-glow': `color-mix(in srgb, ${color} 25%, transparent)`,
        '--logo-bg': `color-mix(in srgb, ${color} 35%, transparent)`,
      }}
    >
      <div className="card-head">
        <div className="house-names">
          <div className="house-name-main">{name}</div>
          <div className="house-name-alt">{altName}</div>
        </div>
        {isLeader && <span className="crown" title="Leading">♛</span>}
      </div>

      <div className="points-display" style={{ color: color }}>
        {points.toLocaleString()}
        <span className="pts-label">PTS · {capacityPct.toFixed(1)}%</span>
      </div>

      <div className="hourglass-wrap">
        <MemoHourglass
          points={points}
          color={color}
          colorSoft={colorSoft}
          houseId={id}
          pulsing={pulsing}
        />
      </div>

      {!voiceAvailable && (
        <div className="quick-btns">
          {[1, 5, 10, 50, 100].map(n => (
            <button key={`p${n}`} className="pos" onClick={() => onQuick(id, n)}>+{n}</button>
          ))}
          {[1, 5, 10, 50, 100].map(n => (
            <button key={`n${n}`} className="neg" onClick={() => onQuick(id, -n)}>-{n}</button>
          ))}
        </div>
      )}

      {voiceAvailable && (
        <>
          <button className="toggle-quick" onClick={() => onToggleQuick(id)}>
            {showQuick ? '▼ HIDE' : '▸ SHOW'} QUICK
          </button>
          {showQuick && (
            <div className="quick-btns">
              {[1, 5, 10, 50, 100].map(n => (
                <button key={`p${n}`} className="pos" onClick={() => onQuick(id, n)}>+{n}</button>
              ))}
              {[1, 5, 10, 50, 100].map(n => (
                <button key={`n${n}`} className="neg" onClick={() => onQuick(id, -n)}>-{n}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* -----------------------------------------
   MAIN APP
----------------------------------------- */

function App() {
  const [state, setState] = useState(defaultState);
  const [pulseMap, setPulseMap] = useState({});
  const [textCmd, setTextCmd] = useState('');
  const [status, setStatus] = useState({ kind: 'info', msg: 'Connecting to the register…' });
  const [listening, setListening] = useState(false);
  const [showQuickFor, setShowQuickFor] = useState({}); // houseId -> bool

  const srRef = useRef(null);
  const voiceAvailable = useMemo(() => getSpeechRecognition() !== null, []);

  // ----- Shiny bridge: receive authoritative state + write results -----
  useEffect(() => {
    if (!hasShiny()) {
      setStatus({ kind: 'err', msg: 'Server bridge unavailable — running detached.' });
      return;
    }

    let gotState = false;

    Shiny.addCustomMessageHandler('houseCup:state', (msg) => {
      gotState = true;
      setState(normalizeServerState(msg));
    });

    Shiny.addCustomMessageHandler('houseCup:ready', (msg) => {
      setStatus({ kind: 'info', msg: 'Ready. Try: 50 points to Walden.' });
    });

    Shiny.addCustomMessageHandler('houseCup:writeError', (msg) => {
      setStatus({ kind: 'err', msg: (msg && msg.message) || 'Could not save that award.' });
    });

    // Ask the server for current state. This is racy by nature: React may mount
    // before or after Shiny connects, and the very first input value can be
    // dropped if sent too early. So we keep re-requesting (each with a unique
    // value so the event always re-fires) until the first state actually
    // arrives, then stop. Each request is a cheap REDCap read; in practice this
    // settles in one or two ticks.
    let tries = 0;
    const tick = () => {
      if (gotState || tries > 20) { clearInterval(initId); return; }
      const app = Shiny.shinyapp;
      if (app && app.isConnected && app.isConnected()) {
        Shiny.setInputValue('hc_request_init', `${Date.now()}-${tries}`, { priority: 'event' });
        tries++;
      }
    };
    const initId = setInterval(tick, 600);
    tick();
    return () => clearInterval(initId);
  }, []);

  // Build speech recognition once
  useEffect(() => {
    if (!voiceAvailable) return;
    const SR = getSpeechRecognition();
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-US';
    r.maxAlternatives = 3;
    r.onresult = (ev) => {
      const candidates = [];
      for (let i = 0; i < ev.results.length; i++) {
        for (let j = 0; j < ev.results[i].length; j++) {
          candidates.push(ev.results[i][j].transcript);
        }
      }
      // Try each candidate and use the first that parses to a valid house
      let applied = false;
      for (const c of candidates) {
        const parsed = parseCommand(c);
        if (parsed && parsed.house && typeof parsed.delta === 'number') {
          applyDelta(parsed.house.id, parsed.delta, 'voice', c);
          applied = true;
          break;
        }
      }
      if (!applied) {
        setStatus({ kind: 'err', msg: `Heard: "${candidates[0] || ''}". Try: 50 points to Walden.` });
      }
    };
    r.onerror = (e) => {
      if (e && e.error === 'not-allowed') {
        setStatus({ kind: 'err', msg: 'Microphone permission denied.' });
      } else if (e && e.error === 'no-speech') {
        setStatus({ kind: 'info', msg: 'No speech detected. Try again.' });
      } else {
        setStatus({ kind: 'err', msg: 'Voice error: ' + (e && e.error ? e.error : 'unknown') });
      }
      setListening(false);
    };
    r.onend = () => setListening(false);
    srRef.current = r;
    return () => {
      try { r.onresult = r.onerror = r.onend = null; r.abort(); } catch (_) {}
      srRef.current = null;
    };
  }, [voiceAvailable]);

  const triggerPulse = useCallback((id) => {
    setPulseMap(m => ({ ...m, [id]: (m[id] || 0) + 1 }));
    setTimeout(() => {
      setPulseMap(m => {
        const n = { ...m };
        n[id] = Math.max(0, (n[id] || 1) - 1);
        if (n[id] === 0) delete n[id];
        return n;
      });
    }, 900);
  }, []);

  const applyDelta = useCallback((houseId, delta, source, raw) => {
    if (!delta) return;
    let actualDelta = 0;
    setState(prev => {
      const cur = prev.points[houseId] || 0;
      const next = Math.max(0, Math.min(MAX_POINTS, cur + delta));
      const actual = next - cur;
      if (actual === 0) return prev;
      actualDelta = actual;
      const house = HOUSES.find(h => h.id === houseId);
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        amount: actual,
        houseId,
        houseName: house ? house.name : houseId,
        source: source || 'manual',
        raw: raw || null,
      };
      return {
        points: { ...prev.points, [houseId]: next },
        history: [entry, ...prev.history].slice(0, 50),
      };
    });

    // Persist to REDCap via the Shiny server. The server clamps against its
    // own authoritative total and echoes back the corrected state.
    if (hasShiny()) {
      Shiny.setInputValue('hc_award', {
        houseId,
        delta,
        source: source || 'manual',
        raw: raw || null,
        nonce: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      }, { priority: 'event' });
    }

    triggerPulse(houseId);
    const h = HOUSES.find(x => x.id === houseId);
    setStatus({
      kind: 'ok',
      msg: `${delta > 0 ? '+' : ''}${delta} pts ${delta > 0 ? 'to' : 'from'} ${h ? h.name : houseId}${source === 'voice' ? ' (voice)' : ''}`,
    });
  }, [triggerPulse]);

  const handleQuick = useCallback((id, delta) => {
    applyDelta(id, delta, 'button');
  }, [applyDelta]);

  const handleSubmit = useCallback(() => {
    const cmd = textCmd.trim();
    if (!cmd) return;
    const parsed = parseCommand(cmd);
    if (parsed.error) {
      setStatus({ kind: 'err', msg: parsed.error });
      return;
    }
    applyDelta(parsed.house.id, parsed.delta, 'text', cmd);
    setTextCmd('');
  }, [textCmd, applyDelta]);

  const handleMicClick = useCallback(() => {
    if (!voiceAvailable || !srRef.current) return;
    if (listening) {
      try { srRef.current.stop(); } catch (_) {}
      setListening(false);
      return;
    }
    try {
      srRef.current.start();
      setListening(true);
      setStatus({ kind: 'info', msg: 'Listening…' });
    } catch (e) {
      // Already-started errors land here; ignore.
      setListening(true);
    }
  }, [voiceAvailable, listening]);

  const toggleQuick = useCallback((id) => {
    setShowQuickFor(m => ({ ...m, [id]: !m[id] }));
  }, []);

  // Re-pull authoritative state from REDCap. (Replaces the old localStorage
  // "Strike All" — history is now server-derived and cannot be wiped here.)
  const refresh = useCallback(() => {
    if (!hasShiny()) return;
    setStatus({ kind: 'info', msg: 'Refreshing from the register…' });
    Shiny.setInputValue('hc_request_init', Date.now(), { priority: 'event' });
  }, []);

  // Leader computation
  const leader = useMemo(() => {
    let maxPts = -1;
    let leaders = [];
    HOUSES.forEach(h => {
      const p = state.points[h.id] || 0;
      if (p > maxPts) { maxPts = p; leaders = [h]; }
      else if (p === maxPts) { leaders.push(h); }
    });
    if (maxPts === 0) return { type: 'none' };
    if (leaders.length > 1) return { type: 'tie', houses: leaders, pts: maxPts };
    return { type: 'solo', house: leaders[0], pts: maxPts };
  }, [state.points]);

  const leaderId = leader.type === 'solo' ? leader.house.id : null;

  return (
    <div className="app">
      <header className="header">
        <div className="eyebrow">Saint Louis University · Internal Medicine Residency</div>
        <h1 className="title">The House Cup</h1>
        {state.acadYear && <div className="acad-year">{state.acadYear}</div>}
        <div className="title-flourish">✦ · ✦ · ✦</div>
        <div className="eyebrow" style={{ marginTop: 14 }}>Being a Register of Merit, kept by the Program</div>
        <div className="subrule">
          <span className="line" />
          {leader.type === 'none' && (
            <span className="leader">
              <span className="label">AWAITING</span>
              <span className="house-name">the first entry</span>
            </span>
          )}
          {leader.type === 'solo' && (
            <span className="leader">
              <span className="label">IN THE LEAD</span>
              <span className="house-name">{leader.house.name} · {leader.house.altName}</span>
              <span style={{ color: 'var(--ink-faint)', marginLeft: 10, fontStyle: 'italic' }}>({leader.pts.toLocaleString()})</span>
            </span>
          )}
          {leader.type === 'tie' && (
            <span className="leader">
              <span className="label">AT PAR</span>
              <span className="tie">
                {leader.houses.map(h => h.name).join(' · ')}
              </span>
              <span style={{ color: 'var(--ink-faint)', marginLeft: 10, fontStyle: 'italic' }}>({leader.pts.toLocaleString()})</span>
            </span>
          )}
          <span className="line" />
        </div>
      </header>

      <main>
        <div className="grid">
          {HOUSES.map(h => (
            <HouseCard
              key={h.id}
              house={h}
              points={state.points[h.id] || 0}
              isLeader={h.id === leaderId}
              pulsing={!!pulseMap[h.id]}
              showQuick={!!showQuickFor[h.id]}
              onQuick={handleQuick}
              onToggleQuick={toggleQuick}
              voiceAvailable={voiceAvailable}
            />
          ))}
        </div>

        <div className="command">
          <div className="command-title">The Scrivener's Desk</div>
          <div className="command-row">
            <input
              className="command-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="e.g. 50 points to Walden   ·   take 10 from Drake   ·   Fitch +25"
              value={textCmd}
              onChange={(e) => setTextCmd(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            />
            <button className="btn-cast" onClick={handleSubmit}>Inscribe</button>
            {voiceAvailable && (
              <button
                className={`btn-mic ${listening ? 'listening' : ''}`}
                onClick={handleMicClick}
                aria-label={listening ? 'Stop listening' : 'Start voice command'}
                title={listening ? 'Stop listening' : 'Voice command'}
              >
                <MicIcon listening={listening} />
              </button>
            )}
          </div>
          <div className="command-hint">
            Form: <code>[n] points to [house]</code> · <code>add [n] [house]</code> · <code>remove [n] from [house]</code> · <code>[house] +[n]</code>
            {!voiceAvailable && <span style={{ opacity: 0.75 }}> · Voice unavailable on this device — the quick buttons may be used instead.</span>}
          </div>

          <div className="speed-section">
            <div className="speed-title">Quick Award</div>
            <div className="speed-grid">
              {HOUSES.map(h => (
                <div key={h.id} className="speed-row">
                  <span className="speed-house" style={{ color: h.color }}>{h.name}</span>
                  <div className="speed-buttons">
                    {[5, 10, 25, 50].map(n => (
                      <button
                        key={n}
                        className="speed-btn"
                        style={{ color: h.color }}
                        onClick={() => applyDelta(h.id, n, 'desk', `+${n} ${h.name}`)}
                        aria-label={`Award ${n} points to ${h.name}`}
                      >+{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`command-status ${status.kind}`}>{status.msg}</div>
        </div>

        <div className="history">
          <div className="history-head">
            <h3>Ledger of Late Entries</h3>
            <button className="history-clear" onClick={refresh}>↻ Refresh</button>
          </div>
          <ul>
            {state.history.length === 0 && (
              <li className="empty">No entries yet — the Cup awaits its first inscription.</li>
            )}
            {state.history.slice(0, 5).map((h, idx) => {
              const house = HOUSES.find(x => x.id === h.houseId);
              const amt = h.amount;
              const pos = amt > 0;
              return (
                <li key={h.id} style={{ opacity: 1 - idx * 0.10 }}>
                  <span className="time">{formatTimeAgo(h.timestamp)}</span>
                  <span className={`amt ${pos ? 'pos' : 'neg'}`}>{pos ? '+' : ''}{amt}</span>
                  <span className="house" style={{ color: house ? house.color : 'var(--ink)' }}>
                    {pos ? '→' : '←'} {house ? house.name : h.houseName}
                    {(h.source === 'text' || h.source === 'voice') && h.raw &&
                      <em className="note"> · “{h.raw}”</em>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
}

function formatTimeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  return d + 'd ago';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
