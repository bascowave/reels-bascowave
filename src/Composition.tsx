import { CalculateMetadataFunction, Composition } from "remotion";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

// Paleta
const BG_TOP = "#0a0a1f";
const BG_BOTTOM = "#1a0b3d";
const PURPLE = "#7c5cff";
const CYAN = "#22d3ee";
const YELLOW = "#ffd23f";
const WHITE = "#ffffff";
const MUTED = "#a9b1c9";
const CARD = "rgba(255,255,255,0.07)";
const CARD_BORDER = "rgba(255,255,255,0.14)";

type Props = {};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return { durationInFrames: sec(52) };
};

// Fundo: gradiente com blobs coloridos que se movem devagar
const Background = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const blob = (x: number, y: number, color: string, size: number, phase: number) => (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(t * 0.6 + phase) * 120,
        top: y + Math.cos(t * 0.5 + phase) * 80,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(120px)",
        opacity: 0.45,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${BG_TOP}, ${BG_BOTTOM})`, overflow: "hidden" }}>
      {blob(-200, -200, PURPLE, 800, 0)}
      {blob(1200, 300, CYAN, 700, 2)}
      {blob(600, 700, YELLOW, 500, 4)}
    </AbsoluteFill>
  );
};

// Fade de entrada e saída da cena
const SceneFade: React.FC<{ children: React.ReactNode; duration: number }> = ({ children, duration }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, duration - 12, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// Logo: marca OpenBot (ícone de robô + nome). Troque por <Img src={staticFile("logo.png")} /> quando tiver o arquivo.
const Logo: React.FC<{ size?: number; delay?: number }> = ({ size = 140, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 120 } });
  const float = Math.sin((frame / FPS) * 2) * 8;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.25,
        transform: `scale(${interpolate(p, [0, 1], [0.4, 1])}) translateY(${float}px)`,
        opacity: p,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 80px ${PURPLE}88`,
        }}
      >
        {/* Rosto do robô */}
        <div style={{ display: "flex", gap: size * 0.14 }}>
          <div style={{ width: size * 0.14, height: size * 0.2, borderRadius: 12, background: WHITE }} />
          <div style={{ width: size * 0.14, height: size * 0.2, borderRadius: 12, background: WHITE }} />
        </div>
      </div>
      <div
        style={{
          fontSize: size * 0.55,
          fontWeight: 900,
          letterSpacing: -2,
          background: `linear-gradient(90deg, ${WHITE}, ${CYAN})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        OpenBot
      </div>
    </div>
  );
};

// Título que entra palavra por palavra
const WordsTitle: React.FC<{
  text: string;
  size?: number;
  color?: string;
  delay?: number;
  highlight?: string[];
}> = ({ text, size = 92, color = WHITE, delay = 0, highlight = [] }) => {
  const words = text.split(" ");
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 900,
        color,
        textAlign: "center",
        lineHeight: 1.15,
        padding: "0 90px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 22px",
      }}
    >
      {words.map((w, i) => (
        <Word
          key={i}
          word={w}
          delay={delay + i * 4}
          color={highlight.includes(w.replace(/[?.,!]/g, "")) ? YELLOW : color}
        />
      ))}
    </div>
  );
};

const Word: React.FC<{ word: string; delay: number; color: string }> = ({ word, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  return (
    <span
      style={{
        display: "inline-block",
        color,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px) scale(${interpolate(p, [0, 1], [0.8, 1])})`,
      }}
    >
      {word}
    </span>
  );
};

// Cena 1: gancho
const Scene1 = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <WordsTitle
      text="Você acha que ter uma equipe de agentes de IA é coisa de grande?"
      size={84}
      highlight={["grande"]}
    />
  </AbsoluteFill>
);

// Cena 2: revelação do logo
const Scene2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const badge = spring({ frame: frame - sec(1.2), fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 60 }}>
      <Logo size={190} />
      <div
        style={{
          fontSize: 62,
          fontWeight: 900,
          color: "#0a0a1f",
          background: YELLOW,
          padding: "16px 40px",
          borderRadius: 999,
          transform: `scale(${interpolate(badge, [0, 1], [0, 1])}) rotate(${interpolate(badge, [0, 1], [-8, -3])}deg)`,
        }}
      >
        Alternativa GRÁTIS
      </div>
    </AbsoluteFill>
  );
};

// Cena 3: plataformas
const Platform: React.FC<{ name: string; index: number }> = ({ name, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - sec(0.6) - index * 8, fps, config: { damping: 11 } });
  return (
    <div
      style={{
        background: CARD,
        border: `2px solid ${CARD_BORDER}`,
        borderRadius: 32,
        padding: "44px 64px",
        fontSize: 56,
        fontWeight: 800,
        color: WHITE,
        transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
        opacity: p,
      }}
    >
      {name}
    </div>
  );
};

const Scene3 = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 70 }}>
    <WordsTitle text="Roda no seu computador" size={70} highlight={["seu"]} />
    <div style={{ display: "flex", gap: 40 }}>
      {["Windows", "Mac", "Linux"].map((n, i) => (
        <Platform key={n} name={n} index={i} />
      ))}
    </div>
  </AbsoluteFill>
);

// Cena 4: equipe de agentes conectados
const AGENT_POS = [
  { x: 260, y: 300 },
  { x: 1340, y: 300 },
  { x: 260, y: 640 },
  { x: 1340, y: 640 },
];
const LINKS: [number, number][] = [
  [0, 1],
  [1, 3],
  [3, 2],
  [2, 0],
];

const Agent: React.FC<{ name: string; index: number }> = ({ name, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - index * 6, fps, config: { damping: 12 } });
  const pulse = 1 + 0.03 * Math.sin((frame / FPS) * 3 + index);
  return (
    <div
      style={{
        position: "absolute",
        left: AGENT_POS[index].x,
        top: AGENT_POS[index].y,
        width: 340,
        height: 130,
        background: CARD,
        border: `3px solid ${CYAN}`,
        boxShadow: `0 0 40px ${CYAN}55`,
        borderRadius: 26,
        color: WHITE,
        fontSize: 44,
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.5, 1]) * pulse})`,
      }}
    >
      {name}
    </div>
  );
};

const Scene4 = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [sec(0.8), sec(3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 110, width: "100%" }}>
        <WordsTitle text="Cada agente com nome e tarefa própria" size={60} />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {LINKS.map(([a, b], i) => (
          <line
            key={i}
            x1={AGENT_POS[a].x + 170}
            y1={AGENT_POS[a].y + 65}
            x2={AGENT_POS[b].x + 170}
            y2={AGENT_POS[b].y + 65}
            stroke={YELLOW}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={1000}
            strokeDashoffset={1000 * (1 - progress)}
          />
        ))}
      </svg>
      {["Agente 1", "Agente 2", "Agente 3", "Agente 4"].map((n, i) => (
        <Agent key={n} name={n} index={i} />
      ))}
    </AbsoluteFill>
  );
};

// Cena 5: provedores
const Provider: React.FC<{ name: string; index: number }> = ({ name, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - sec(0.6) - index * 6, fps, config: { damping: 9 } });
  const highlight = name === "Grok";
  return (
    <div
      style={{
        background: highlight ? YELLOW : CARD,
        border: `2px solid ${highlight ? YELLOW : CARD_BORDER}`,
        color: highlight ? "#0a0a1f" : WHITE,
        borderRadius: 26,
        padding: "28px 46px",
        fontSize: 48,
        fontWeight: 900,
        transform: `scale(${interpolate(p, [0, 1], [0, 1])})`,
        opacity: p,
      }}
    >
      {name}
    </div>
  );
};

const Scene5 = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 60 }}>
    <WordsTitle text="Vários provedores de IA" size={64} highlight={["Vários"]} />
    <div style={{ display: "flex", flexWrap: "wrap", gap: 30, justifyContent: "center", maxWidth: 1500 }}>
      {["Claude Code", "Gemini", "Grok", "Ollama", "LM Studio"].map((n, i) => (
        <Provider key={n} name={n} index={i} />
      ))}
    </div>
  </AbsoluteFill>
);

// Cena 6: custo
const Scene6 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 8 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
      <div
        style={{
          fontSize: 260,
          fontWeight: 900,
          background: `linear-gradient(90deg, ${YELLOW}, ${CYAN})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          transform: `scale(${interpolate(p, [0, 1], [0.4, 1])})`,
        }}
      >
        R$ 0
      </div>
      <WordsTitle text="Uso pessoal: você paga só o seu provedor de IA" size={58} delay={sec(0.8)} />
    </AbsoluteFill>
  );
};

// Cena 7: cuidado e CTA
const Scene7 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 1 + 0.04 * Math.sin((frame / FPS) * Math.PI * 2);
  const btn = spring({ frame: frame - sec(1), fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 60 }}>
      <WordsTitle text="Dê só tarefas em que você confia e mantenha backup" size={50} color={MUTED} />
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: "#0a0a1f",
          background: `linear-gradient(90deg, ${YELLOW}, ${CYAN})`,
          padding: "30px 70px",
          borderRadius: 34,
          boxShadow: `0 0 90px ${CYAN}88`,
          opacity: btn,
          transform: `scale(${interpolate(btn, [0, 1], [0.6, 1]) * pulse})`,
        }}
      >
        openbot.run
      </div>
    </AbsoluteFill>
  );
};

export const OpenBotVideo: React.FC<Props> = () => {
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, Arial, sans-serif", color: WHITE }}>
      <Background />
      <Sequence from={sec(0)} durationInFrames={sec(5)}>
        <SceneFade duration={sec(5)}>
          <Scene1 />
        </SceneFade>
      </Sequence>
      <Sequence from={sec(5)} durationInFrames={sec(7)}>
        <SceneFade duration={sec(7)}>
          <Scene2 />
        </SceneFade>
      </Sequence>
      <Sequence from={sec(12)} durationInFrames={sec(8)}>
        <SceneFade duration={sec(8)}>
          <Scene3 />
        </SceneFade>
      </Sequence>
      <Sequence from={sec(20)} durationInFrames={sec(10)}>
        <SceneFade duration={sec(10)}>
          <Scene4 />
        </SceneFade>
      </Sequence>
      <Sequence from={sec(30)} durationInFrames={sec(8)}>
        <SceneFade duration={sec(8)}>
          <Scene5 />
        </SceneFade>
      </Sequence>
      <Sequence from={sec(38)} durationInFrames={sec(8)}>
        <SceneFade duration={sec(8)}>
          <Scene6 />
        </SceneFade>
      </Sequence>
      <Sequence from={sec(46)} durationInFrames={sec(6)}>
        <SceneFade duration={sec(6)}>
          <Scene7 />
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <Composition
      id="OpenBotVideo"
      component={OpenBotVideo}
      durationInFrames={sec(52)}
      fps={FPS}
      width={1920}
      height={1080}
      calculateMetadata={calculateMetadata}
    />
  );
};
