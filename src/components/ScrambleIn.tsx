import { useEffect, useRef, useState } from "react";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface ScrambleInProps {
  text: string;
  delay: number;
  triggered: boolean;
  className?: string;
}

export function ScrambleIn({ text, delay, triggered, className }: ScrambleInProps) {
  const [display, setDisplay] = useState<string>("");
  const [started, setStarted] = useState(false);
  const frameRef = useRef(0);
  const cursorRef = useRef(0);

  useEffect(() => {
    if (!triggered) return;
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [triggered, delay]);

  useEffect(() => {
    if (!started) return;

    frameRef.current = 0;
    cursorRef.current = 0;

    const interval = setInterval(() => {
      frameRef.current += 1;
      if (frameRef.current % 2 === 0) {
        cursorRef.current = Math.min(cursorRef.current + 1, text.length);
      }

      const revealCount = cursorRef.current;
      const noiseAhead = 3;

      let next = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") {
          next += " ";
        } else if (i < revealCount) {
          next += ch;
        } else if (i < revealCount + noiseAhead) {
          next += randomChar();
        } else {
          next += "";
        }
      }
      setDisplay(next);

      if (revealCount >= text.length) {
        clearInterval(interval);
        setDisplay(text);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [started, text]);

  if (!triggered) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: "&nbsp;" }} />;
  }

  return <span className={className}>{display || "\u00A0"}</span>;
}

export default ScrambleIn;
