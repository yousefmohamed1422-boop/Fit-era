import { useId } from 'react';

/**
 * Placeholder product art: a shaded SVG garment that morphs smoothly between colors.
 * Once you have real product photos, render <img src={p.image}> instead (see ProductCard `image` prop).
 */
const SHAPES = {
  tee: {
    body: 'M158 46 C170 92 230 92 242 46 L306 64 C330 72 352 96 372 132 L334 178 L298 154 L298 396 C298 404 290 410 282 410 Q200 420 118 410 C110 410 102 404 102 396 L102 154 L66 178 L28 132 C48 96 70 72 94 64 Z',
    neck: 'M158 46 C170 92 230 92 242 46',
    neckOpen: 'M158 46 C170 92 230 92 242 46 C226 38 174 38 158 46 Z',
    seams: ['M94 64 C84 100 98 132 102 154', 'M306 64 C316 100 302 132 298 154'],
    stitch: ['M34 127 L71 173', 'M366 127 L329 173', 'M106 397 Q200 407 294 397'],
    chest: [262, 150], dy: 0,
  },
  baby: {
    body: 'M158 46 C170 92 230 92 242 46 L302 62 C322 70 340 90 358 120 L326 160 L296 140 L296 296 C296 304 288 308 280 308 Q200 318 120 308 C112 308 104 304 104 296 L104 140 L74 160 L42 120 C60 90 78 70 98 62 Z',
    neck: 'M158 46 C170 92 230 92 242 46',
    neckOpen: 'M158 46 C170 92 230 92 242 46 C226 38 174 38 158 46 Z',
    seams: ['M98 62 C88 90 100 120 104 140', 'M302 62 C312 90 300 120 296 140'],
    stitch: ['M47 116 L78 152', 'M353 116 L322 152', 'M108 294 Q200 304 292 294'],
    chest: [258, 138], dy: 34,
  },
  tank: {
    body: 'M150 30 L176 34 C184 84 216 84 224 34 L250 30 C256 70 276 96 300 106 L300 396 C300 404 292 410 284 410 Q200 420 116 410 C108 410 100 404 100 396 L100 106 C124 96 144 70 150 30 Z',
    neck: 'M176 34 C184 84 216 84 224 34',
    neckOpen: 'M176 34 C184 84 216 84 224 34 C212 26 188 26 176 34 Z',
    seams: [],
    stitch: ['M144 36 C138 72 120 98 104 108', 'M256 36 C262 72 280 98 296 108', 'M104 397 Q200 407 296 397'],
    chest: [252, 150], dy: 4,
  },
  long: {
    body: 'M158 46 C170 92 230 92 242 46 L300 62 C324 70 342 88 348 116 L376 372 C377 380 372 384 366 385 L340 388 C334 388 330 384 329 378 L298 178 L298 396 C298 404 290 410 282 410 Q200 420 118 410 C110 410 102 404 102 396 L102 178 L71 378 C70 384 66 388 60 388 L34 385 C28 384 23 380 24 372 L52 116 C58 88 76 70 100 62 Z',
    neck: 'M158 46 C170 92 230 92 242 46',
    neckOpen: 'M158 46 C170 92 230 92 242 46 C226 38 174 38 158 46 Z',
    seams: ['M84 74 C70 110 98 150 102 178', 'M316 74 C330 110 302 150 298 178'],
    stitch: ['M28 352 L67 358', 'M372 352 L333 358', 'M106 397 Q200 407 294 397'],
    chest: [262, 150], dy: 0,
  },
};

const luminance = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

export default function Garment({ shape = 'tee', color = '#F3EFE6', className = '', style, label = true, title }) {
  const s = SHAPES[shape] || SHAPES.tee;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const light = luminance(color) > 0.55;
  const line = light ? 'rgba(23,23,23,.20)' : 'rgba(255,255,255,.20)';
  const ink = light ? '#171717' : '#F7F4EE';
  const tr = 'fill .7s ease, stroke .7s ease';

  return (
    <svg viewBox="0 0 400 440" className={className} style={style} role="img" aria-label={title || `${shape} garment`}>
      <defs>
        <clipPath id={`c${uid}`}><path d={s.body} /></clipPath>
        <linearGradient id={`h${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".20" />
          <stop offset=".2" stopColor="#000" stopOpacity=".02" />
          <stop offset=".42" stopColor="#fff" stopOpacity={light ? '.28' : '.14'} />
          <stop offset=".72" stopColor="#000" stopOpacity=".0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
        <linearGradient id={`v${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".10" />
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".14" />
        </linearGradient>
        <filter id={`f${uid}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id={`s${uid}`} x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="12" /></filter>
      </defs>

      <g transform={`translate(0 ${s.dy})`}>
        <ellipse cx="200" cy={(shape === 'baby' ? 316 : 419)} rx="132" ry="9" fill="rgba(0,0,0,.28)" filter={`url(#s${uid})`} />
        <path d={s.body} style={{ fill: color, transition: tr }} />

        <g clipPath={`url(#c${uid})`}>
          <rect width="400" height="440" fill={`url(#h${uid})`} />
          <rect width="400" height="440" fill={`url(#v${uid})`} />
          <g filter={`url(#f${uid})`} fill="none" strokeLinecap="round">
            <path d="M148 150 C162 226 138 300 152 404" stroke={light ? 'rgba(0,0,0,.09)' : 'rgba(255,255,255,.10)'} strokeWidth="9" />
            <path d="M252 150 C240 230 262 320 248 404" stroke={light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.09)'} strokeWidth="9" />
            <path d="M204 118 C210 200 194 300 202 410" stroke="rgba(255,255,255,.16)" strokeWidth="14" />
          </g>
          <path d={s.neckOpen} fill={light ? 'rgba(0,0,0,.16)' : 'rgba(0,0,0,.4)'} />
        </g>

        <path d={s.body} fill="none" style={{ stroke: line, transition: tr }} strokeWidth="1.4" strokeLinejoin="round" />
        {/* neck rib */}
        <path d={s.neck} fill="none" style={{ stroke: color, transition: tr }} strokeWidth="9" strokeLinecap="round" />
        <path d={s.neck} fill="none" stroke={light ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.10)'} strokeWidth="9" strokeLinecap="round" />
        <path d={s.neck} fill="none" style={{ stroke: line, transition: tr }} strokeWidth="1.2" transform="translate(0 6)" strokeDasharray="3 3" />
        {s.seams.map((d) => <path key={d} d={d} fill="none" style={{ stroke: line, transition: tr }} strokeWidth="1.4" />)}
        {s.stitch.map((d) => <path key={d} d={d} fill="none" style={{ stroke: line, transition: tr }} strokeWidth="1.2" strokeDasharray="4 3.5" />)}

        {label && (
          <text
            x={s.chest[0]} y={s.chest[1]} textAnchor="middle" fontFamily="Anton, Impact, sans-serif"
            fontSize="9.5" letterSpacing="2.2" style={{ fill: ink, transition: tr }} opacity=".62"
          >
            FIT ERA
          </text>
        )}
      </g>
    </svg>
  );
}
