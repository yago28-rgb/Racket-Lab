import type { Racket } from "@/types/product";
import { maxBeam } from "@/lib/recommendation/profile";
import { hoopOutline, racketDims, stringLines, throatHole, throatOutline, toPath } from "@/lib/racket-geometry";
import { luminance, shade } from "@/lib/color";
import { fullRacketName } from "@/lib/format";

interface Props {
  racket: Racket;
  /** Rotation in degrees. */
  angle?: number;
  className?: string;
  /** Unique suffix when the same racket renders twice on a page. */
  uid?: string;
  showShadow?: boolean;
  /** Use a shared viewBox (sized for a 110 in² frame) so several rackets render at true relative scale. */
  commonScale?: boolean;
}

/**
 * Studio-style illustration generated from the racket's real head size,
 * beam and string pattern. Used whenever licensed photography is missing.
 * It is labelled as an illustration (aria + caption), never passed off as a photo.
 */
export function RacketArt({ racket, angle = -24, className, uid = "a", showShadow = true, commonScale = false }: Props) {
  const s = racket.specs;
  const d = racketDims(s.headSizeSqIn ?? 100, maxBeam(s.beamMm) ?? 23, s.lengthIn ?? 27);
  const { mains, crosses } = stringLines(d, s.pattern?.mains ?? 16, s.pattern?.crosses ?? 19);
  const c = racket.colorway;
  const id = `${racket.id}-${uid}`;
  const light = luminance(c.frame) > 0.6;
  const edge = light ? shade(c.frame, -0.25) : shade(c.frame, 0.35);
  const gripTop = d.handleTop;
  // Bounding box of the rotated frame, so any angle fits without clipping.
  const rad = (angle * Math.PI) / 180;
  const boxB = commonScale ? racketDims(110).bOut : d.bOut;
  const hx = Math.abs(Math.cos(rad)) * boxB + Math.abs(Math.sin(rad)) * (d.length / 2);
  const hy = Math.abs(Math.sin(rad)) * boxB + Math.abs(Math.cos(rad)) * (d.length / 2);
  const pad = 1.4;
  const cy = d.length / 2;

  return (
    <svg
      viewBox={`${-hx - pad} ${cy - hy - pad} ${(hx + pad) * 2} ${(hy + pad) * 2}`}
      className={className}
      role="img"
      aria-label={`Ilustración de estudio de la ${fullRacketName(racket)}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`${id}-f`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(c.frame, -0.35)} />
          <stop offset="0.45" stopColor={c.frame} />
          <stop offset="0.6" stopColor={shade(c.frame, 0.28)} />
          <stop offset="1" stopColor={shade(c.frame, -0.3)} />
        </linearGradient>
        <linearGradient id={`${id}-t`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(c.accent, -0.35)} />
          <stop offset="0.5" stopColor={c.accent} />
          <stop offset="1" stopColor={shade(c.accent, -0.3)} />
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(c.grip, -0.2)} />
          <stop offset="0.5" stopColor={shade(c.grip, 0.15)} />
          <stop offset="1" stopColor={shade(c.grip, -0.25)} />
        </linearGradient>
        <radialGradient id={`${id}-s`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {showShadow && <ellipse cx="0" cy={cy + hy + 0.7} rx={hx * 0.75} ry="0.5" fill={`url(#${id}-s)`} />}

      {/* Flip so y grows upward (geometry space), then rotate around the head centre. */}
      <g transform={`translate(0 ${d.length}) scale(1 -1) rotate(${-angle} 0 ${d.length / 2})`}>
        {/* Strings */}
        <g stroke={c.strings} strokeWidth="0.055" strokeLinecap="round" opacity="0.92">
          {mains.map((l, i) => (
            <line key={`m${i}`} x1={l.from[0]} y1={l.from[1]} x2={l.to[0]} y2={l.to[1]} />
          ))}
          {crosses.map((l, i) => (
            <line key={`c${i}`} x1={l.from[0]} y1={l.from[1]} x2={l.to[0]} y2={l.to[1]} />
          ))}
        </g>

        {/* Throat */}
        <path d={toPath(throatOutline(d)) + " " + toPath(throatHole(d))} fill={`url(#${id}-t)`} fillRule="evenodd" />
        {/* Hoop */}
        <path d={toPath(hoopOutline(d))} fill={`url(#${id}-f)`} stroke={edge} strokeWidth="0.03" />

        {/* Handle */}
        <rect x={-d.handleHalfWidth} y={0.25} width={d.handleHalfWidth * 2} height={gripTop - 0.25} rx="0.18" fill={`url(#${id}-g)`} />
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={i}
            x1={-d.handleHalfWidth}
            x2={d.handleHalfWidth}
            y1={0.9 + i * 0.68}
            y2={1.2 + i * 0.68}
            stroke={shade(c.grip, light ? -0.4 : 0.18)}
            strokeWidth="0.04"
            opacity="0.5"
          />
        ))}
        <rect x={-d.handleHalfWidth - 0.08} y={0} width={(d.handleHalfWidth + 0.08) * 2} height={0.42} rx="0.14" fill={shade(c.grip, -0.3)} />
        <rect x={-d.handleHalfWidth - 0.02} y={gripTop - 0.3} width={(d.handleHalfWidth + 0.02) * 2} height={0.3} rx="0.08" fill={c.accent} />
      </g>
    </svg>
  );
}
