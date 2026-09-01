import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ScrambleIn } from "./ScrambleIn";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4";

const SENSITIVITY = 0.8;

interface HeroSectionProps {
  entranceComplete: boolean;
}

export function HeroSection({ entranceComplete }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastMouseX = useRef<number | null>(null);
  const targetTime = useRef(0);
  const seeking = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;

    const handleSeeked = () => {
      seeking.current = false;
      if (Math.abs(video.currentTime - targetTime.current) > 0.01) {
        seeking.current = true;
        video.currentTime = targetTime.current;
      }
    };

    const handleLoadedMetadata = () => {
      video.currentTime = 0;
    };

    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    const handleMouseMove = (e: MouseEvent) => {
      if (!video.duration) return;

      if (lastMouseX.current === null) {
        lastMouseX.current = e.clientX;
        return;
      }

      const deltaX = e.clientX - lastMouseX.current;
      lastMouseX.current = e.clientX;

      const deltaTime = (deltaX / window.innerWidth) * video.duration * SENSITIVITY;
      let next = targetTime.current + deltaTime;
      next = Math.max(0, Math.min(video.duration, next));
      targetTime.current = next;

      if (!seeking.current) {
        seeking.current = true;
        video.currentTime = next;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section className="relative h-screen h-[100dvh] w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ transform: "translateY(50px)" }}
      >
        <span
          className="uppercase font-display"
          style={{
            fontSize: "clamp(120px, 30vw, 521px)",
            letterSpacing: "-4px",
            opacity: 0.1,
            backgroundImage:
              "radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
          }}
        >
          TRANSCENDENCE
        </span>
      </div>

      <div className="relative z-10 h-full flex flex-col px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="flex-1" />

        <motion.div
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: entranceComplete ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex flex-col gap-4">
            <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)]">
              <ScrambleIn text="Brain" delay={200} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="And Body" delay={500} triggered={entranceComplete} />
            </h1>

            <motion.p
              className="max-w-sm text-[13px] sm:text-[15px] text-white/60 leading-relaxed"
              initial={{ y: 25, opacity: 0 }}
              animate={
                entranceComplete ? { y: 0, opacity: 1 } : { y: 25, opacity: 0 }
              }
              transition={{
                duration: 0.9,
                ease: [0.215, 0.61, 0.355, 1.0],
                delay: 0.2,
              }}
            >
              Built at the intersection of neuroscience and artificial
              intelligence. SynapseX continuously maps neural pathways,
              cognitive load, and physiological states into a single adaptive
              intelligence layer.
            </motion.p>
          </div>

          <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)] text-left md:text-right">
            <ScrambleIn text="One" delay={700} triggered={entranceComplete} />
            <br />
            <ScrambleIn text="Network" delay={1000} triggered={entranceComplete} />
          </h1>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
