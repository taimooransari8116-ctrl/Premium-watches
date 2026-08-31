import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

const VIDEOS = {
  hero: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4",
  cinematic: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4",
  metrics: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4",
  technology: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4",
  footer: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4",
};

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";
const randChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

/* ---------- Scramble entrance reveal ---------- */
function ScrambleIn({ text, delay, triggered, style }) {
  const [display, setDisplay] = useState("");
  const [started, setStarted] = useState(false);
  const frame = useRef(0);
  const cursor = useRef(0);

  useEffect(() => {
    if (!triggered) return;
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [triggered, delay]);

  useEffect(() => {
    if (!started) return;
    frame.current = 0;
    cursor.current = 0;
    const id = setInterval(() => {
      frame.current += 1;
      if (frame.current % 2 === 0) cursor.current = Math.min(cursor.current + 1, text.length);
      const revealCount = cursor.current;
      let next = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") next += " ";
        else if (i < revealCount) next += ch;
        else if (i < revealCount + 3) next += randChar();
      }
      setDisplay(next);
      if (revealCount >= text.length) {
        clearInterval(id);
        setDisplay(text);
      }
    }, 25);
    return () => clearInterval(id);
  }, [started, text]);

  if (!triggered) return <span style={style}>&nbsp;</span>;
  return <span style={style}>{display || "\u00A0"}</span>;
}

/* ---------- Scramble on hover ---------- */
function ScrambleText({ text, isHovered, style }) {
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);

  useEffect(() => {
    if (!isHovered) {
      setDisplay(text);
      return;
    }
    frame.current = 0;
    const id = setInterval(() => {
      frame.current += 1;
      const revealCount = Math.floor(frame.current / 4);
      let next = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        next += ch === " " ? " " : i < revealCount ? ch : randChar();
      }
      setDisplay(next);
      if (revealCount >= text.length) {
        clearInterval(id);
        setDisplay(text);
      }
    }, 25);
    return () => clearInterval(id);
  }, [isHovered, text]);

  return <span style={style}>{display}</span>;
}

/* ---------- Logo mark, 4-fold symmetric ---------- */
const LOGO_PATH =
  "M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z";

function Logo({ size = 18, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" fill={color}>
      <path d={LOGO_PATH} />
      <path d={LOGO_PATH} transform="rotate(90)" />
      <path d={LOGO_PATH} transform="rotate(180)" />
      <path d={LOGO_PATH} transform="rotate(270)" />
    </svg>
  );
}

function AppleIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 384 512" fill="#000">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

/* ---------- Hamburger ---------- */
function Hamburger({ open }) {
  const spring = { type: "spring", stiffness: 300, damping: 20 };
  const w = 18, h = 12, bar = 1.5;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <motion.span
        style={{ position: "absolute", left: 0, width: "100%", height: bar, background: "#fff", borderRadius: 9999, top: 0 }}
        animate={open ? { top: h / 2 - bar / 2, rotate: 45 } : { top: 0, rotate: 0 }}
        transition={spring}
      />
      <motion.span
        style={{ position: "absolute", left: 0, width: "100%", height: bar, background: "#fff", borderRadius: 9999, top: h / 2 - bar / 2 }}
        animate={open ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={spring}
      />
      <motion.span
        style={{ position: "absolute", left: 0, width: "100%", height: bar, background: "#fff", borderRadius: 9999, bottom: 0 }}
        animate={open ? { bottom: h / 2 - bar / 2, rotate: -45 } : { bottom: 0, rotate: 0 }}
        transition={spring}
      />
    </div>
  );
}

/* ---------- Navbar ---------- */
function Navbar({ entranceComplete }) {
  const [open, setOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [dlHover, setDlHover] = useState(false);

  const scrollToSection = (mult) => {
    const root = document.getElementById("synx-root");
    const h = root ? root.clientHeight / 6.7 : window.innerHeight;
    (root || window).scrollTo({ top: h * mult, behavior: "smooth" });
  };

  return (
    <motion.nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 68,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        background: "transparent",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: entranceComplete ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <motion.div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            borderRadius: 10,
            height: 36,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
          animate={{ width: open ? 0 : "auto", paddingLeft: open ? 0 : 12, paddingRight: open ? 0 : 12, opacity: open ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        >
          <Logo size={14} />
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em" }}>SynapseX</span>
        </motion.div>

        <motion.div
          style={{
            display: "flex",
            alignItems: "center",
            height: 36,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            borderRadius: 10,
            overflow: "hidden",
          }}
          animate={{ width: open ? 220 : 36 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        >
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: open ? 28 : 36,
              height: open ? 28 : 36,
              marginLeft: open ? 4 : 0,
              borderRadius: open ? 8 : 10,
              background: open ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none",
              flexShrink: 0,
            }}
            aria-label="Toggle menu"
          >
            <Hamburger open={open} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingLeft: 12, paddingRight: 14 }}>
            {["About", "Metrics"].map((label, i) => (
              <motion.button
                key={label}
                initial={false}
                animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
                transition={{ duration: 0.3, delay: open ? 0.1 + i * 0.05 : 0 }}
                onClick={() => scrollToSection(label === "About" ? 1 : 2)}
                onMouseEnter={() => setHoveredLink(label)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap" }}
              >
                <ScrambleText text={label} isHovered={hoveredLink === label} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onMouseEnter={() => setDlHover(true)}
        onMouseLeave={() => setDlHover(false)}
        style={{
          height: 36,
          padding: "0 16px",
          background: "#fff",
          borderRadius: 9999,
          border: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <AppleIcon size={14} />
        <ScrambleText text="Download" isHovered={dlHover} style={{ fontSize: 13, fontWeight: 500, color: "#000" }} />
      </motion.button>
    </motion.nav>
  );
}

/* ---------- Hero ---------- */
function HeroSection({ entranceComplete }) {
  const videoRef = useRef(null);
  const lastX = useRef(null);
  const target = useRef(0);
  const seeking = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();

    const onSeeked = () => {
      seeking.current = false;
      if (Math.abs(video.currentTime - target.current) > 0.01) {
        seeking.current = true;
        video.currentTime = target.current;
      }
    };
    video.addEventListener("seeked", onSeeked);

    const onMove = (e) => {
      if (!video.duration) return;
      const rect = video.getBoundingClientRect();
      if (lastX.current === null) {
        lastX.current = e.clientX;
        return;
      }
      const deltaX = e.clientX - lastX.current;
      lastX.current = e.clientX;
      const deltaTime = (deltaX / rect.width) * video.duration * 0.8;
      target.current = Math.max(0, Math.min(video.duration, target.current + deltaTime));
      if (!seeking.current) {
        seeking.current = true;
        video.currentTime = target.current;
      }
    };
    video.addEventListener("mousemove", onMove);

    return () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("mousemove", onMove);
    };
  }, []);

  const h1Style = {
    color: "#fff",
    fontWeight: 300,
    lineHeight: 0.95,
    letterSpacing: "-0.03em",
    fontSize: "clamp(34px, 9vw, 70px)",
  };

  return (
    <section style={{ position: "relative", height: "100vh", minHeight: 560, width: "100%", overflow: "hidden", background: "#000" }}>
      <video
        ref={videoRef}
        src={VIDEOS.hero}
        muted
        playsInline
        preload="auto"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.05,
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", transform: "translateY(40px)" }}>
        <span
          style={{
            fontFamily: '"Anton SC", sans-serif',
            textTransform: "uppercase",
            fontSize: "clamp(90px, 26vw, 420px)",
            letterSpacing: "-4px",
            opacity: 0.1,
            backgroundImage: "radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
          }}
        >
          TRANSCENDENCE
        </span>
      </div>

      <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", padding: "76px 16px 32px" }}>
        <div style={{ flex: 1 }} />
        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: entranceComplete ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <h1 style={h1Style}>
            <ScrambleIn text="Brain" delay={200} triggered={entranceComplete} />
            <br />
            <ScrambleIn text="And Body" delay={500} triggered={entranceComplete} />
          </h1>

          <motion.p
            style={{ maxWidth: 340, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}
            initial={{ y: 25, opacity: 0 }}
            animate={entranceComplete ? { y: 0, opacity: 1 } : { y: 25, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1.0], delay: 0.2 }}
          >
            Built at the intersection of neuroscience and artificial intelligence.
            SynapseX continuously maps neural pathways, cognitive load, and
            physiological states into a single adaptive intelligence layer.
          </motion.p>

          <h1 style={{ ...h1Style, textAlign: "left" }}>
            <ScrambleIn text="One" delay={700} triggered={entranceComplete} />
            <br />
            <ScrambleIn text="Network" delay={1000} triggered={entranceComplete} />
          </h1>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Cinematic ---------- */
function CinematicSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"], container: { current: undefined } });
  const smooth = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 });
  const y = useTransform(smooth, [0, 1], [40, -80]);
  const opacity = useTransform(smooth, [0.3, 0.5], [0, 1]);
  const transform = useMotionTemplate`rotateX(18deg) translateY(${y}px) translateZ(10px)`;

  return (
    <section ref={ref} style={{ position: "relative", height: "100vh", minHeight: 560, width: "100%", overflow: "hidden", background: "#000" }}>
      <video src={VIDEOS.cinematic} autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140, background: "linear-gradient(to bottom, #010103, transparent)", zIndex: 10 }} />
      <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", perspective: 400 }}>
        <motion.p
          style={{
            transform,
            opacity,
            fontWeight: 400,
            fontSize: "clamp(18px, 5vw, 30px)",
            color: "#fff",
            lineHeight: 1.35,
            letterSpacing: "-0.02em",
            textAlign: "center",
            maxWidth: 720,
            padding: "0 24px",
          }}
        >
          A neural-AI interface built on the architecture of the human nervous
          system. SynapseX translates synaptic activity into computational
          intelligence. Every signal becomes measurable, structured, and
          visible. It continuously reconstructs internal state as a dynamic
          neural map. Biological noise is filtered into actionable cognitive
          patterns.
        </motion.p>
      </div>
    </section>
  );
}

/* ---------- Metrics ---------- */
function MetricsSection() {
  const metrics = [
    { value: "2.4ms", label: "Synaptic Latency" },
    { value: "99.7%", label: "Signal Accuracy" },
    { value: "140B", label: "Neural Parameters" },
  ];
  return (
    <section style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", background: "#000" }}>
      <video src={VIDEOS.metrics} autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", padding: "96px 20px", maxWidth: 900, margin: "0 auto" }}>
        <motion.p
          style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 56, textAlign: "center" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2 }}
        >
          Performance Metrics
        </motion.p>
        <div style={{ display: "flex", flexDirection: "column", gap: 48, width: "100%" }}>
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              style={{ textAlign: "center" }}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            >
              <div style={{ fontSize: "clamp(44px, 14vw, 72px)", fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1 }}>{m.value}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 12, letterSpacing: "0.02em" }}>{m.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Technology ---------- */
function TechnologySection() {
  const features = [
    { title: "Cortical Mapping", desc: "Real-time spatial reconstruction of active neural regions." },
    { title: "Signal Isolation", desc: "Separates cognitive intent from biological noise." },
    { title: "State Prediction", desc: "Anticipates cognitive transitions before they occur." },
    { title: "Loop Feedback", desc: "Closed-loop adjustment based on outcome correlation." },
  ];
  return (
    <section style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", background: "#000" }}>
      <video src={VIDEOS.technology} autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "56px 24px" }}>
        <motion.h2
          style={{ fontWeight: 300, fontSize: "clamp(32px, 9vw, 56px)", lineHeight: 0.95, letterSpacing: "-0.03em" }}
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0 }}
        >
          Adaptive
          <br />
          Intelligence
        </motion.h2>

        <motion.p
          style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6, maxWidth: 320, marginTop: 20 }}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, delay: 0.2 }}
        >
          The system learns your neural baseline within 72 hours. From there,
          every cognitive state is mapped, predicted, and optimized in real
          time.
        </motion.p>

        <div style={{ flex: 1, minHeight: 40 }} />

        <motion.div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, delay: 0.3 }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 400, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Architecture ---------- */
function ArchitectureSection() {
  const layers = [
    { layer: "Layer 1", name: "Capture" },
    { layer: "Layer 2", name: "Process" },
    { layer: "Layer 3", name: "Interface" },
  ];
  return (
    <section style={{ position: "relative", minHeight: "100vh", width: "100%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 640, padding: "96px 24px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.div
          style={{ textAlign: "center" }}
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.0 }}
        >
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>
            Architecture
          </p>
          <h2 style={{ fontWeight: 300, fontSize: "clamp(26px, 7vw, 44px)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Three layers. Zero friction.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
            Sensor layer captures raw bioelectric signals. Processing layer
            isolates intent. Interface layer delivers structured output to
            any connected system.
          </p>
        </motion.div>

        <motion.div
          style={{ marginTop: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          {layers.map((item) => (
            <div
              key={item.layer}
              style={{
                width: "100%",
                maxWidth: 380,
                height: 68,
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>{item.layer}</span>
              <span style={{ fontSize: 16, fontWeight: 300 }}>{item.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer style={{ position: "relative", width: "100%", background: "#000", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 380 }}>
        <div style={{ width: "100%", height: 260 }}>
          <video src={VIDEOS.footer} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <Logo size={16} color="rgba(255,255,255,0.7)" />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500 }}>SynapseX</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6, maxWidth: 340 }}>
              The next evolution of human-machine interaction. Built for
              those who refuse to be limited by biology alone.
            </p>
          </div>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 32 }}>
            (c) 2026 SynapseX Labs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- App ---------- */
export default function SynapseXApp() {
  const [entranceComplete, setEntranceComplete] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntranceComplete(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      id="synx-root"
      style={{
        fontFamily: '"Space Mono", monospace',
        background: "#000",
        color: "#fff",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Anton+SC&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #000; }
      `}</style>
      <Navbar entranceComplete={entranceComplete} />
      <HeroSection entranceComplete={entranceComplete} />
      <CinematicSection />
      <MetricsSection />
      <TechnologySection />
      <ArchitectureSection />
      <Footer />
    </div>
  );
}
