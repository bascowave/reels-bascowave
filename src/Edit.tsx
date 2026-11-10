import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/InterTight";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import data from "./edit-data.json";

const { fontFamily: DISPLAY } = loadDisplay("normal", { weights: ["700", "900"], subsets: ["latin", "latin-ext"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

const C = {
  bg: "#F4F2EE",
  fg: "#111114",
  blue: "#1D8CF0",
  navy: "#0B1240",
  claude: "#D97757",
};

// pop suave com leve overshoot
const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 160, mass: 0.8 } });
};
const useOut = (dur: number, len = 8) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [f(dur) - len, f(dur)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(70% 60% at 100% 0%, rgba(147,197,253,.55), transparent 70%),
        radial-gradient(60% 55% at 100% 100%, rgba(253,214,170,.6), transparent 70%), ${C.bg}`,
    }}
  />
);

// ---------- tela em janela com zoom ----------
type Z = [number, number, number, number];
const zoomAt = (t: number) => {
  const z = data.zoom as Z[];
  let i = 0;
  while (i < z.length - 1 && z[i + 1][0] <= t) i++;
  const cur = z[i];
  const prev = i > 0 ? z[i - 1] : cur;
  const p = interpolate(t, [cur[0], cur[0] + 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const lerp = (a: number, b: number) => a + (b - a) * p;
  return { s: lerp(prev[1], cur[1]), x: lerp(prev[2], cur[2]), y: lerp(prev[3], cur[3]) };
};

const Screen: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const { s, x, y } = zoomAt(t);
  const intro = interpolate(frame, [f(2.2), f(2.9)], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const W = 1700;
  const H = (W * 9) / 16;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: W,
          height: H,
          borderRadius: 22,
          overflow: "hidden",
          marginTop: -40,
          transform: `scale(${intro})`,
          boxShadow: "0 30px 80px rgba(20,20,40,.28), 0 4px 14px rgba(0,0,0,.12)",
          background: "#000",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${s})`,
            transformOrigin: `${x * 100}% ${y * 100}%`,
          }}
        >
          <OffthreadVideo src={staticFile("cut.mp4")} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- legenda ----------
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cap = data.captions.find((c) => t >= c.s && t < c.e);
  if (!cap) return null;
  const local = frame - f(cap.s);
  const sc = interpolate(local, [0, 4], [0.92, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46 }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 50,
          letterSpacing: "-0.02em",
          color: "#fff",
          background: "rgba(17,17,20,.88)",
          padding: "10px 26px 14px",
          borderRadius: 18,
          transform: `scale(${sc})`,
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        }}
      >
        {cap.text}
      </div>
    </AbsoluteFill>
  );
};

// ---------- pílula de palavra-chave ----------
const Pill: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const p = usePop();
  const o = useOut(dur);
  return (
    <AbsoluteFill style={{ alignItems: "flex-start", justifyContent: "flex-start", padding: "70px 0 0 110px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "#fff",
          borderRadius: 999,
          padding: "14px 30px 16px 22px",
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 44,
          color: C.fg,
          letterSpacing: "-0.02em",
          boxShadow: "0 12px 34px rgba(20,20,40,.22)",
          transform: `scale(${p * o})`,
          transformOrigin: "left center",
          opacity: o,
        }}
      >
        <span style={{ width: 16, height: 16, borderRadius: 99, background: C.blue }} />
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ---------- tela azul-marinho ----------
const Navy: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const frame = useCurrentFrame();
  const inn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const out = useOut(dur, 7);
  const p = usePop(3);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(80% 60% at 50% 120%, #2a3a9a, ${C.navy} 70%)`,
        opacity: Math.min(inn, out),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 120,
          letterSpacing: "-0.035em",
          color: "#fff",
          textAlign: "center",
          maxWidth: 1500,
          lineHeight: 1.02,
          transform: `scale(${0.85 + 0.15 * p})`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ---------- cantoneiras + check ----------
const Check: React.FC = () => {
  const p = usePop();
  const o = useOut(1.8);
  const L = 70;
  const b = `7px solid ${C.blue}`;
  const corner = (st: React.CSSProperties) => (
    <div style={{ position: "absolute", width: L, height: L, ...st }} />
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", inset: `${70 - 30 * p}px ${130 - 30 * p}px ${150 - 30 * p}px` }}>
        {corner({ top: 0, left: 0, borderTop: b, borderLeft: b })}
        {corner({ top: 0, right: 0, borderTop: b, borderRight: b })}
        {corner({ bottom: 0, left: 0, borderBottom: b, borderLeft: b })}
        {corner({ bottom: 0, right: 0, borderBottom: b, borderRight: b })}
      </div>
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 30,
          width: 96,
          height: 96,
          borderRadius: 99,
          background: C.blue,
          color: "#fff",
          fontSize: 60,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${p})`,
          boxShadow: "0 10px 30px rgba(29,140,240,.45)",
          fontFamily: DISPLAY,
        }}
      >
        ✓
      </div>
    </AbsoluteFill>
  );
};

// ---------- painel lateral (cards) ----------
const Panel: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const p = usePop();
  const o = useOut(dur);
  return (
    <AbsoluteFill style={{ background: `rgba(244,242,238,${0.82 * Math.min(p, o)})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p) * o }}>{children}</div>
    </AbsoluteFill>
  );
};
const Card: React.FC<{ title: string; items: string[]; dark?: boolean; delay: number }> = ({ title, items, dark, delay }) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        width: 620,
        background: dark ? C.navy : "#fff",
        color: dark ? "#fff" : C.fg,
        borderRadius: 28,
        padding: "40px 44px",
        boxShadow: "0 24px 60px rgba(20,20,40,.2)",
        transform: `scale(${p})`,
        fontFamily: DISPLAY,
      }}
    >
      <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.6, fontFamily: MONO, marginBottom: 16 }}>{title}</div>
      {items.map((it) => (
        <div key={it} style={{ fontSize: 54, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
          {it}
        </div>
      ))}
    </div>
  );
};

const Compare: React.FC = () => (
  <Panel dur={data.compare.d}>
    <div style={{ display: "flex", gap: 50, alignItems: "center" }}>
      <Card title="PRONTOS PRA USAR" items={["Grokbot", "Dots · OpenAI", "Moose · Meta"]} delay={0} />
      <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 80, color: C.fg }}>×</div>
      <Card title="MAIS ABERTOS" items={["Hermes", "Open Cloud"]} dark delay={8} />
    </div>
  </Panel>
);

const Big: React.FC<{ n: string; label: string; delay: number }> = ({ n, label, delay }) => {
  const p = usePop(delay);
  return (
    <div style={{ background: "#fff", borderRadius: 28, padding: "40px 60px", textAlign: "center", transform: `scale(${p})`, boxShadow: "0 24px 60px rgba(20,20,40,.2)", fontFamily: DISPLAY }}>
      <div style={{ fontSize: 170, fontWeight: 900, letterSpacing: "-0.04em", color: C.blue, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 44, fontWeight: 700, color: C.fg }}>{label}</div>
    </div>
  );
};
const Numbers: React.FC = () => (
  <Panel dur={data.numbers.d}>
    <div style={{ display: "flex", gap: 60 }}>
      <Big n="1 GB" label="vídeos" delay={0} />
      <Big n="~100 MB" label="por arquivo" delay={f(2.2)} />
    </div>
  </Panel>
);

const PROMPT = "Crie uma rotina para identificar potenciais assuntos para criação de vídeo. Faça isso toda segunda.";
const Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.min(PROMPT.length, Math.floor(frame * 1.2));
  const p = usePop();
  const o = useOut(data.terminal.d);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-end", padding: "60px 90px 0 0" }}>
      <div style={{ width: 760, background: "#fff", borderRadius: 22, padding: 30, boxShadow: "0 24px 60px rgba(20,20,40,.25)", transform: `scale(${p})`, transformOrigin: "right top", opacity: o }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, marginBottom: 16 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: C.claude }} /> Nova rotina
        </div>
        <div style={{ fontFamily: MONO, fontSize: 28, lineHeight: 1.45, color: C.fg }}>
          &gt; {PROMPT.slice(0, n)}
          <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>▌</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Diagram: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = ["comercial", "conteúdo", "infra", "comando"];
  const pc = usePop();
  return (
    <Panel dur={data.diagram.d}>
      <svg width={1500} height={760} viewBox="0 0 1500 760" style={{ overflow: "visible" }}>
        {nodes.map((n, i) => {
          const x = 180 + i * 380;
          const d = 10 + i * 6;
          const p = spring({ frame: frame - d, fps: FPS, config: { damping: 12, stiffness: 160 } });
          const len = interpolate(frame, [d, d + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={n}>
              <path
                d={`M750 250 C750 420 ${x} 380 ${x} 540`}
                fill="none"
                stroke={C.blue}
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - len}
              />
              <g transform={`translate(${x} 600) scale(${p})`}>
                <rect x={-160} y={-60} width={320} height={120} rx={60} fill="#fff" style={{ filter: "drop-shadow(0 12px 24px rgba(20,20,40,.2))" }} />
                <text textAnchor="middle" y={18} fontFamily={DISPLAY} fontWeight={900} fontSize={52} fill={C.fg}>
                  {n}
                </text>
              </g>
            </g>
          );
        })}
        <g transform={`translate(750 170) scale(${pc})`}>
          <rect x={-300} y={-80} width={600} height={160} rx={36} fill={C.navy} />
          <text textAnchor="middle" y={22} fontFamily={DISPLAY} fontWeight={900} fontSize={64} fill="#fff">
            chefe de equipe
          </text>
        </g>
      </svg>
    </Panel>
  );
};

const EndCard: React.FC = () => {
  const p = usePop(4);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Background />
      <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 130, letterSpacing: "-0.04em", color: C.fg, transform: `scale(${p})` }}>
        Grokbot na prática
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ at: number; src: string; vol?: number }> = ({ at, src, vol = 0.5 }) => (
  <Sequence from={f(at)} durationInFrames={f(0.6)} layout="none">
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={vol} />
  </Sequence>
);

export const END_SECONDS = 6;

export const Edit: React.FC = () => {
  const D = data.duration;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence durationInFrames={f(D)}>
        <Background />
        <Screen />
        {data.pills.map((p, i) => {
          const next = data.pills[i + 1]?.t ?? D;
          const dur = Math.min(2.6, next - p.t - 0.1);
          return (
            <Sequence key={i} from={f(p.t)} durationInFrames={Math.max(1, f(dur))}>
              <Pill text={p.text} dur={dur} />
            </Sequence>
          );
        })}
        <Sequence from={f(data.compare.t)} durationInFrames={f(data.compare.d)}>
          <Compare />
        </Sequence>
        <Sequence from={f(data.numbers.t)} durationInFrames={f(data.numbers.d)}>
          <Numbers />
        </Sequence>
        <Sequence from={f(data.terminal.t)} durationInFrames={f(data.terminal.d)}>
          <Terminal />
        </Sequence>
        <Sequence from={f(data.diagram.t)} durationInFrames={f(data.diagram.d)}>
          <Diagram />
        </Sequence>
        {data.checks.map((t, i) => (
          <Sequence key={i} from={f(t)} durationInFrames={f(1.8)}>
            <Check />
          </Sequence>
        ))}
        <Captions />
        {data.navy.map((n, i) => (
          <Sequence key={i} from={f(n.t)} durationInFrames={f(n.d)}>
            <Navy text={n.text} dur={n.d} />
          </Sequence>
        ))}
      </Sequence>
      <Sequence from={f(D)} durationInFrames={f(END_SECONDS)}>
        <EndCard />
      </Sequence>

      {/* efeitos sonoros */}
      {data.pills.map((p, i) => (
        <Sfx key={`p${i}`} at={p.t} src="pop" vol={0.35} />
      ))}
      {data.navy.map((n, i) => (
        <React.Fragment key={`n${i}`}>
          <Sfx at={n.t} src="hit" vol={0.6} />
          <Sfx at={n.t + n.d - 0.25} src="whoosh" vol={0.45} />
        </React.Fragment>
      ))}
      {data.checks.map((t, i) => (
        <Sfx key={`c${i}`} at={t} src="pop" vol={0.45} />
      ))}
      {[data.compare.t, data.numbers.t, data.diagram.t].map((t, i) => (
        <Sfx key={`w${i}`} at={t} src="whoosh" vol={0.4} />
      ))}
      {Array.from({ length: Math.ceil(PROMPT.length / 1.2 / 3) }).map((_, i) => (
        <Sfx key={`k${i}`} at={data.terminal.t + i * 0.1} src="click" vol={0.15} />
      ))}
      <Sfx at={D} src="whoosh" vol={0.45} />
    </AbsoluteFill>
  );
};
