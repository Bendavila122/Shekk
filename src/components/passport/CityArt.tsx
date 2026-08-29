/**
 * Original vector artwork for the Shekk Passport city spreads.
 *
 * Every scene is hand-built here from simple shapes — no scraped or licensed
 * artwork. Scenes share a small kit of primitives (sky, sun, sea, hills, birds)
 * so the book feels like one illustrated system, while each city keeps its own
 * silhouette and colour story.
 *
 * All motion is CSS-driven and disabled under prefers-reduced-motion (see the
 * .pp-* rules in styles.css).
 */
import type { CityTheme } from "@/lib/passport";

const VB = "0 0 200 130";

/* ---------------------------------------------------------------- primitives */

function Sky({ from, to }: { from: string; to: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`sky-${from}-${to}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="130" fill={`url(#sky-${from}-${to})`} />
    </>
  );
}

function Sun({ x = 158, y = 30, r = 13, fill = "#ffd88a" }) {
  return (
    <g className="pp-sun">
      <circle cx={x} cy={y} r={r + 7} fill={fill} opacity="0.22" />
      <circle cx={x} cy={y} r={r} fill={fill} />
    </g>
  );
}

function Moon({ x = 160, y = 28 }) {
  return (
    <g opacity="0.9">
      <circle cx={x} cy={y} r={10} fill="#fdf4d2" />
      <circle cx={x - 5} cy={y - 3} r={9} fill="#3a3f6b" />
    </g>
  );
}

function Birds({ x = 40, y = 26 }: { x?: number; y?: number }) {
  return (
    <g className="pp-birds" stroke="#3b3b4a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.55">
      <path d={`M${x} ${y} q3 -3 6 0 q3 -3 6 0`} />
      <path d={`M${x + 16} ${y + 9} q2.4 -2.4 4.8 0 q2.4 -2.4 4.8 0`} />
      <path d={`M${x - 14} ${y + 13} q2 -2 4 0 q2 -2 4 0`} />
    </g>
  );
}

function Cloud({ x = 40, y = 24, s = 1, delay = 0 }) {
  return (
    <g className="pp-cloud" style={{ animationDelay: `${delay}s` }} opacity="0.85">
      <g transform={`translate(${x} ${y}) scale(${s})`} fill="#ffffff">
        <ellipse cx="0" cy="0" rx="12" ry="7" />
        <ellipse cx="10" cy="3" rx="10" ry="6" />
        <ellipse cx="-10" cy="3" rx="9" ry="5" />
      </g>
    </g>
  );
}

/** Layered sea with two gently drifting wave bands. */
function Sea({ y = 92, from = "#63b6d8", to = "#2f7fa8" }) {
  return (
    <>
      <rect x="0" y={y} width="200" height={130 - y} fill={to} />
      <rect x="0" y={y} width="200" height={(130 - y) / 2} fill={from} opacity="0.75" />
      <g fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.55">
        <path className="pp-wave" d={`M-40 ${y + 8} q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0`} />
        <path
          className="pp-wave pp-wave-slow"
          d={`M-40 ${y + 18} q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0`}
          opacity="0.7"
        />
      </g>
    </>
  );
}

function Palm({ x = 24, y = 100, s = 1, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 q-2 -14 1 -26" stroke="#7a5433" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g className="pp-palm" style={{ transformOrigin: "1px -26px" }}>
        <path d="M1 -26 q-14 -4 -18 4 q10 -1 18 -1" fill="#2f8f5b" />
        <path d="M1 -26 q14 -5 19 3 q-10 -1 -19 0" fill="#37a066" />
        <path d="M1 -26 q-8 -12 -18 -12 q8 4 17 12" fill="#2b8353" />
        <path d="M1 -26 q9 -12 19 -11 q-9 4 -18 12" fill="#35a469" />
      </g>
    </g>
  );
}

function Hills({ fill = "#8fae74", y = 84, opacity = 1 }) {
  return (
    <path
      d={`M-10 130 L-10 ${y + 12} q30 -22 58 -4 q26 -20 52 -2 q30 -18 62 2 L210 130 Z`}
      fill={fill}
      opacity={opacity}
    />
  );
}

function Ground({ fill = "#e3d3ac", y = 104 }) {
  return <path d={`M-10 130 L-10 ${y} q100 -8 220 0 L210 130 Z`} fill={fill} />;
}

/** Simple building block with windows. */
function Block({
  x,
  y,
  w,
  h,
  fill,
  windows = true,
  roof,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  windows?: boolean;
  roof?: string;
}) {
  const cols = Math.max(1, Math.floor(w / 7));
  const rows = Math.max(1, Math.floor(h / 9));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="1.5" fill={fill} />
      {roof ? <rect x={x - 1} y={y - 2} width={w + 2} height="3" rx="1" fill={roof} /> : null}
      {windows
        ? Array.from({ length: cols * rows }).map((_, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            return (
              <rect
                key={i}
                x={x + 2.5 + c * (w / cols)}
                y={y + 3 + r * (h / rows)}
                width={Math.max(1.6, w / cols - 3.4)}
                height={Math.max(1.6, h / rows - 4.5)}
                rx="0.6"
                fill="#fff8e2"
                opacity={(i * 7) % 5 === 0 ? 0.45 : 0.85}
              />
            );
          })
        : null}
    </g>
  );
}

function Dome({ x, y, r, fill, top = "#d8b25a" }: { x: number; y: number; r: number; fill: string; top?: string }) {
  return (
    <g>
      <path d={`M${x - r} ${y} a${r} ${r} 0 0 1 ${r * 2} 0 Z`} fill={fill} />
      <rect x={x - r} y={y} width={r * 2} height="2" fill={top} opacity="0.6" />
      <circle cx={x} cy={y - r - 2.5} r="1.8" fill={top} />
    </g>
  );
}

/* -------------------------------------------------------------------- scenes */

function Jerusalem() {
  return (
    <>
      <Sky from="#ffe6bb" to="#f6c98a" />
      <Sun x={150} y={34} fill="#ffcf7a" />
      <Birds x={44} y={24} />
      <Hills fill="#cbb083" y={90} opacity={0.55} />
      {/* Old City wall */}
      <g>
        <rect x="-10" y="86" width="220" height="30" fill="#e6cfa2" />
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={i} x={-8 + i * 10} y="82" width="6" height="5" fill="#e6cfa2" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-4 + i * 18} y="96" width="7" height="9" rx="3.5" fill="#c9ab74" opacity="0.7" />
        ))}
      </g>
      <Dome x={62} y={86} r={16} fill="#d9a83f" top="#f0cd72" />
      <Dome x={128} y={88} r={10} fill="#9fb7c9" top="#e8e2cf" />
      <rect x="98" y="66" width="5" height="22" fill="#c2a370" />
      <rect x="96" y="62" width="9" height="5" rx="1.5" fill="#d9c090" />
      <Ground fill="#d8bd8c" y={112} />
      {/* olive trees */}
      {[18, 172].map((x) => (
        <g key={x}>
          <rect x={x} y="106" width="2.5" height="10" fill="#7c6242" />
          <circle cx={x + 1} cy="104" r="7" fill="#7f9c6b" />
        </g>
      ))}
    </>
  );
}

function TelAviv() {
  return (
    <>
      <Sky from="#bfe6f7" to="#ffe0bd" />
      <Sun x={44} y={30} fill="#ffd27a" />
      <Cloud x={140} y={24} s={0.8} />
      <Birds x={100} y={20} />
      {/* Bauhaus skyline */}
      <Block x={110} y={54} w={26} h={40} fill="#f4f1e6" roof="#e2ddcd" />
      <rect x="112" y="60" width="22" height="4" rx="2" fill="#dfd8c4" />
      <rect x="112" y="70" width="22" height="4" rx="2" fill="#dfd8c4" />
      <Block x={142} y={44} w={20} h={50} fill="#fbf7ec" />
      <Block x={166} y={62} w={22} h={32} fill="#f0ecdf" roof="#ded7c4" />
      <Ground fill="#f3dfae" y={94} />
      <Sea y={100} from="#6cc6e0" to="#2f93b8" />
      <Palm x={26} y={100} s={1.1} />
      <Palm x={58} y={104} s={0.85} flip />
      {/* beach umbrella + towel */}
      <g>
        <rect x="86" y="98" width="1.6" height="10" fill="#8b6a45" />
        <path d="M78 98 a9 6 0 0 1 18 0 Z" fill="#ef7b6f" />
        <rect x="96" y="106" width="16" height="4" rx="2" fill="#f6d17a" />
      </g>
    </>
  );
}

function Haifa() {
  return (
    <>
      <Sky from="#cfeef0" to="#eaf6e4" />
      <Sun x={40} y={28} fill="#ffe08f" />
      <Cloud x={150} y={22} s={0.7} delay={2} />
      {/* hillside */}
      <path d="M-10 130 L-10 96 Q60 30 210 22 L210 130 Z" fill="#9dbd84" />
      <path d="M-10 130 L-10 104 Q70 46 210 40 L210 130 Z" fill="#84a86c" opacity="0.75" />
      {/* terraced gardens */}
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i}>
          <path
            d={`M${96 - i * 3} ${52 + i * 8} h${24 + i * 6} v3 h-${24 + i * 6} Z`}
            fill="#e8efd6"
          />
          <path
            d={`M${96 - i * 3} ${55 + i * 8} h${24 + i * 6} v5 h-${24 + i * 6} Z`}
            fill="#6f9b57"
          />
        </g>
      ))}
      <Dome x={108} y={50} r={9} fill="#d8a73f" top="#f0cd72" />
      <Block x={26} y={70} w={16} h={26} fill="#f2eee2" />
      <Block x={48} y={78} w={14} h={18} fill="#efe9da" />
      <Sea y={110} from="#63b6d8" to="#2d7c9e" />
      {/* port crane */}
      <g stroke="#c96a52" strokeWidth="2" fill="none">
        <path d="M172 110 v-22 h18" />
        <path d="M186 88 v8" />
      </g>
    </>
  );
}

function Eilat() {
  return (
    <>
      <Sky from="#ffd9a8" to="#ffb185" />
      <Sun x={150} y={32} fill="#ff9f5a" />
      {/* red mountains */}
      <path d="M-10 96 L34 52 L70 92 L104 46 L150 94 L210 60 L210 130 L-10 130 Z" fill="#c9765a" />
      <path d="M-10 100 L40 66 L84 100 L128 68 L182 102 L210 84 L210 130 L-10 130 Z" fill="#a85c48" opacity="0.8" />
      <Sea y={96} from="#3fc7d8" to="#1f7fa8" />
      {/* reef fish */}
      <g className="pp-fish">
        <g transform="translate(46 112)">
          <path d="M0 0 q7 -6 15 0 q-7 6 -15 0 Z" fill="#ffd166" />
          <path d="M15 0 l6 -4 v8 Z" fill="#f7a83c" />
          <circle cx="4" cy="-1" r="1" fill="#3c3320" />
        </g>
      </g>
      <g className="pp-fish pp-fish-slow">
        <g transform="translate(120 120) scale(0.8)">
          <path d="M0 0 q8 -6 16 0 q-8 6 -16 0 Z" fill="#ff8f6b" />
          <path d="M16 0 l6 -4 v8 Z" fill="#ef6b4b" />
        </g>
      </g>
      {/* coral */}
      <g stroke="#f28ea8" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M168 128 v-8 M168 122 l-5 -5 M168 122 l5 -6" />
      </g>
    </>
  );
}

function Tiberias() {
  return (
    <>
      <Sky from="#d6ecf7" to="#f6ead2" />
      <Sun x={46} y={26} fill="#ffe093" />
      <Birds x={128} y={26} />
      <path d="M-10 92 Q40 58 90 82 Q140 56 210 78 L210 130 L-10 130 Z" fill="#a9b98a" />
      <path d="M-10 100 Q60 78 120 96 Q170 84 210 96 L210 130 L-10 130 Z" fill="#8ba372" opacity="0.8" />
      <Block x={22} y={80} w={18} h={20} fill="#f4efe2" roof="#d9cdb2" />
      <Dome x={54} y={82} r={7} fill="#e3e0d2" top="#c4b78e" />
      <Sea y={100} from="#7cc9e6" to="#3a8fb5" />
      {/* fishing boat */}
      <g transform="translate(126 104)">
        <path d="M0 6 q10 6 22 0 l-3 -4 h-16 Z" fill="#b4703f" />
        <rect x="10" y="-12" width="1.6" height="14" fill="#8b5a33" />
        <path d="M11.6 -12 l10 12 h-10 Z" fill="#fdfaf0" />
      </g>
    </>
  );
}

function Akko() {
  return (
    <>
      <Sky from="#cfe3f6" to="#f4e6cf" />
      <Cloud x={54} y={22} s={0.9} />
      <Sun x={158} y={28} fill="#ffdb90" />
      {/* sea wall fortress */}
      <g>
        <rect x="20" y="66" width="150" height="34" fill="#e0d2b0" />
        {Array.from({ length: 15 }).map((_, i) => (
          <rect key={i} x={20 + i * 10} y="62" width="6" height="5" fill="#e0d2b0" />
        ))}
        <rect x="30" y="52" width="18" height="48" fill="#d6c39c" />
        <Dome x={104} y={64} r={12} fill="#8fb4c9" top="#e6dcc1" />
        <rect x="140" y="46" width="7" height="54" fill="#e6d8b6" />
        <path d="M143.5 40 l5 8 h-10 Z" fill="#c9b183" />
      </g>
      <Sea y={100} from="#5cb0d4" to="#2b7898" />
      {/* rocks */}
      <path d="M4 122 q10 -12 22 0 Z" fill="#9a8f77" />
      <path d="M172 126 q12 -14 26 0 Z" fill="#9a8f77" />
    </>
  );
}

function Tzfat() {
  return (
    <>
      <Sky from="#dbe7fb" to="#eef1fb" />
      <Cloud x={40} y={22} s={0.8} delay={1} />
      <Cloud x={150} y={30} s={0.6} delay={3} />
      <path d="M-10 130 L-10 92 Q50 44 110 74 Q160 96 210 66 L210 130 Z" fill="#93a7b8" opacity="0.55" />
      {/* stacked blue-door houses */}
      {[
        { x: 26, y: 78, w: 30, h: 26 },
        { x: 60, y: 66, w: 26, h: 38 },
        { x: 92, y: 74, w: 30, h: 30 },
        { x: 126, y: 62, w: 26, h: 42 },
        { x: 156, y: 80, w: 28, h: 24 },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="1.5" fill="#f3efe3" />
          <rect x={b.x} y={b.y - 2} width={b.w} height="3" fill="#dcd4c0" />
          <rect x={b.x + b.w / 2 - 3} y={b.y + b.h - 11} width="6" height="11" rx="1" fill="#3f6fc4" />
          <rect x={b.x + 3} y={b.y + 5} width="5" height="6" rx="1" fill="#5f8ed6" />
          <rect x={b.x + b.w - 8} y={b.y + 5} width="5" height="6" rx="1" fill="#5f8ed6" />
        </g>
      ))}
      <Ground fill="#cdbf9f" y={104} />
      {/* alley steps */}
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={80 + i * 3} y={108 + i * 4} width={40 - i * 6} height="3" fill="#b8a684" />
      ))}
    </>
  );
}

function BeerSheva() {
  return (
    <>
      <Sky from="#ffe9c2" to="#ffd9a1" />
      <Sun x={150} y={30} fill="#ffc46a" />
      <Birds x={44} y={30} />
      {/* dunes */}
      <path d="M-10 130 L-10 100 q50 -22 110 -4 q50 14 110 -6 L210 130 Z" fill="#e8ce9c" />
      <path d="M-10 130 L-10 112 q60 -16 120 -2 q40 10 100 -6 L210 130 Z" fill="#d9b97f" />
      <Block x={110} y={62} w={18} h={42} fill="#f3ecdd" />
      <Block x={134} y={74} w={22} h={30} fill="#eae2d0" />
      {/* bedouin tent */}
      <g>
        <path d="M20 106 q16 -20 34 0 Z" fill="#6d5b48" />
        <path d="M37 106 v-16" stroke="#4c3f31" strokeWidth="1.4" />
      </g>
      {/* acacia */}
      <g transform="translate(78 106)">
        <rect x="-1" y="-12" width="2.4" height="12" fill="#7a6242" />
        <path d="M-14 -12 q14 -10 28 0 Z" fill="#8aa06a" />
      </g>
    </>
  );
}

function Herzliya() {
  return (
    <>
      <Sky from="#cfeafb" to="#f8ecd6" />
      <Sun x={40} y={28} fill="#ffdf95" />
      <Cloud x={130} y={22} s={0.7} />
      <Block x={106} y={40} w={16} h={54} fill="#dfeaf3" />
      <Block x={126} y={52} w={14} h={42} fill="#eaf1f7" />
      <Block x={146} y={46} w={18} h={48} fill="#d8e6f1" />
      <Ground fill="#f2dfb2" y={94} />
      <Sea y={102} from="#68c3e2" to="#2e8ab0" />
      {/* marina masts */}
      {[24, 40, 56, 72].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 102 v-${18 + (i % 2) * 6}`} stroke="#7c8894" strokeWidth="1.4" />
          <path d={`M${x} ${84 - (i % 2) * 6} l8 ${14 + (i % 2) * 4} h-8 Z`} fill="#ffffff" opacity="0.95" />
          <path d={`M${x - 7} 102 q7 6 15 0 Z`} fill="#2f4a63" />
        </g>
      ))}
    </>
  );
}

function Netanya() {
  return (
    <>
      <Sky from="#ffd9c2" to="#ffc2a3" />
      <Sun x={54} y={34} fill="#ff9f6b" />
      <Birds x={140} y={26} />
      {/* cliff */}
      <path d="M-10 130 L-10 62 q60 -6 96 12 l0 56 Z" fill="#e2c898" />
      <path d="M-10 130 L-10 74 q52 -2 86 16 l0 40 Z" fill="#cfae7c" opacity="0.8" />
      <Block x={12} y={44} w={22} h={20} fill="#f6f0e2" roof="#e0d6bf" />
      <Block x={42} y={38} w={16} h={26} fill="#f2ebdb" />
      {/* promenade rail */}
      <g stroke="#b09367" strokeWidth="1.4">
        <path d="M0 42 h60" />
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={i} d={`M${4 + i * 9} 42 v6`} />
        ))}
      </g>
      <Sea y={94} from="#6cc0dd" to="#2d84ac" />
      <Palm x={168} y={104} s={1} />
    </>
  );
}

function Ashdod() {
  return (
    <>
      <Sky from="#ffe2c0" to="#ffc6a0" />
      <Sun x={36} y={32} fill="#ff9d63" />
      {/* port cranes */}
      {[96, 130, 164].map((x, i) => (
        <g key={x} stroke="#d8674f" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d={`M${x} 96 v-${34 + i * 4}`} />
          <path d={`M${x - 16} ${62 - i * 4} h34`} />
          <path d={`M${x + 12} ${62 - i * 4} v8`} />
        </g>
      ))}
      {/* containers */}
      {[
        ["#3f7fb5", 92],
        ["#d9a13f", 112],
        ["#6aa35f", 132],
        ["#c25b57", 152],
      ].map(([fill, x], i) => (
        <rect key={i} x={x as number} y={88} width="18" height="8" rx="1" fill={fill as string} />
      ))}
      <Ground fill="#d8cdb4" y={96} />
      <Sea y={104} from="#5cb2d6" to="#2b7ba0" />
      {/* cargo ship */}
      <g transform="translate(20 106)">
        <path d="M0 8 q18 8 40 0 l-4 -6 h-32 Z" fill="#37506b" />
        <rect x="8" y="-4" width="16" height="6" fill="#c9d4de" />
      </g>
    </>
  );
}

function Ashkelon() {
  return (
    <>
      <Sky from="#e6f0d8" to="#fbe9c8" />
      <Sun x={148} y={28} fill="#ffdd8b" />
      <Cloud x={48} y={24} s={0.7} delay={2} />
      <Hills fill="#b7c48f" y={86} opacity={0.7} />
      {/* fallen roman columns */}
      <g fill="#efe6d0">
        <rect x="30" y="72" width="7" height="32" rx="3" />
        <rect x="48" y="64" width="7" height="40" rx="3" />
        <rect x="66" y="80" width="7" height="24" rx="3" />
        <rect x="86" y="98" width="40" height="7" rx="3.5" transform="rotate(-6 86 98)" />
        <rect x="26" y="60" width="34" height="6" rx="2" />
      </g>
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={30 + (i % 3) * 18} y={70 + Math.floor(i / 3) * 16} width="7" height="2" fill="#d9cbaa" />
      ))}
      <Ground fill="#e6d6a9" y={104} />
      <Sea y={116} from="#63bcdb" to="#2f86ad" />
    </>
  );
}

function Nazareth() {
  return (
    <>
      <Sky from="#efe0f7" to="#fbeddd" />
      <Sun x={44} y={26} fill="#ffd894" />
      <Birds x={140} y={24} />
      <path d="M-10 130 L-10 94 Q60 52 130 78 Q170 92 210 74 L210 130 Z" fill="#a9a184" />
      {/* basilica */}
      <g>
        <rect x="86" y="58" width="34" height="40" fill="#f4eee0" />
        <path d="M86 58 l17 -16 l17 16 Z" fill="#cbb98f" />
        <rect x="100" y="34" width="3" height="10" fill="#b09b6d" />
        <rect x="96" y="76" width="12" height="22" rx="6" fill="#b6a6d6" />
      </g>
      {/* old town houses */}
      {[
        [36, 78],
        [56, 84],
        [130, 80],
        [152, 86],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="20" height={98 - y} fill="#f0e7d5" />
          <rect x={x} y={y - 2} width="20" height="3" fill="#d6c8a6" />
          <rect x={x + 6} y={y + 6} width="7" height="8" rx="1" fill="#9c8cc4" />
        </g>
      ))}
      <Ground fill="#d5c7a2" y={98} />
      {/* market awning */}
      <g>
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={i} x={20 + i * 8} y="106" width="8" height="6" fill={i % 2 ? "#c9615f" : "#f0e5cd"} />
        ))}
      </g>
    </>
  );
}

function RamatGan() {
  return (
    <>
      <Sky from="#d8f0e2" to="#f7f0d6" />
      <Sun x={158} y={28} fill="#ffe28f" />
      <Cloud x={50} y={22} s={0.7} />
      {/* diamond towers */}
      <g>
        <Block x={112} y={34} w={18} h={58} fill="#dde9ef" />
        <path d="M112 34 l9 -10 l9 10 Z" fill="#a9c6d6" />
        <Block x={136} y={48} w={16} h={44} fill="#e8f0f4" />
        <Block x={158} y={40} w={14} h={52} fill="#d3e2ea" />
      </g>
      {/* park */}
      <path d="M-10 130 L-10 88 q60 -14 120 0 L210 92 L210 130 Z" fill="#7fa96a" />
      <path d="M4 112 q30 -12 66 0 q-30 10 -66 0 Z" fill="#5fa7c4" />
      {[24, 44, 82].map((x, i) => (
        <g key={x} transform={`translate(${x} 96)`}>
          <rect x="-1.2" y="-10" width="2.6" height="10" fill="#7b6242" />
          <circle cx="0" cy="-13" r={7 - i} fill="#4f8b48" />
        </g>
      ))}
      {/* bench */}
      <g stroke="#8a6c47" strokeWidth="1.6">
        <path d="M96 108 h16 M98 108 v4 M110 108 v4" />
      </g>
    </>
  );
}

function Caesarea() {
  return (
    <>
      <Sky from="#d5eef7" to="#f8e9cd" />
      <Sun x={150} y={26} fill="#ffe19a" />
      <Birds x={40} y={22} />
      {/* aqueduct */}
      <g fill="#efe3c6">
        <rect x="-10" y="56" width="220" height="10" />
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={i}>
            <rect x={-6 + i * 24} y="66" width="10" height="26" />
            <path d={`M${4 + i * 24} 66 a11 11 0 0 1 22 0 Z`} fill="#efe3c6" opacity="0" />
          </g>
        ))}
      </g>
      {/* roman theatre steps */}
      {Array.from({ length: 5 }).map((_, i) => (
        <path key={i} d={`M${70 - i * 8} ${96 + i * 5} h${60 + i * 16} v4 h-${60 + i * 16} Z`} fill="#e3d6b4" opacity={0.9} />
      ))}
      <Sea y={112} from="#5fc0dc" to="#2b86ab" />
    </>
  );
}

const SCENES: Record<CityTheme, () => JSX.Element> = {
  jerusalem: Jerusalem,
  telaviv: TelAviv,
  haifa: Haifa,
  eilat: Eilat,
  tiberias: Tiberias,
  akko: Akko,
  tzfat: Tzfat,
  beersheva: BeerSheva,
  herzliya: Herzliya,
  netanya: Netanya,
  ashdod: Ashdod,
  ashkelon: Ashkelon,
  nazareth: Nazareth,
  ramatgan: RamatGan,
  caesarea: Caesarea,
};

/**
 * A city's illustration. When `locked`, the same artwork is drawn as a faded
 * pencil sketch — the city is still tantalisingly visible, just not yours yet.
 */
export function CityArt({
  theme,
  locked = false,
  className = "",
}: {
  theme: CityTheme;
  locked?: boolean;
  className?: string;
}) {
  const Scene = SCENES[theme] ?? Jerusalem;
  return (
    <svg
      viewBox={VB}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={locked ? "Undiscovered city illustration" : "City illustration"}
      className={`${className} ${locked ? "pp-sketch" : ""}`}
    >
      <Scene />
      {locked ? <rect x="0" y="0" width="200" height="130" fill="#f6efe0" opacity="0.55" /> : null}
    </svg>
  );
}
