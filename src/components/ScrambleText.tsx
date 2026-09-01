import { useEffect, useRef, useState } from "react";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface ScrambleTextProps {
  text: string;
  isHovered: boolean;
  className?: string;
}

export function ScrambleText({ text, isHovered, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!isHovered) {
      setDisplay(text);
      return;
    }

    frameRef.current = 0;

    const interval = setInterval(() => {
      frameRef.current += 1;
      const revealCount = Math.floor(frameRef.current / 4);

      let next = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") {
          next += " ";
        } else if (i < revealCount) {
          next += ch;
        } else {
          next += randomChar();
        }
      }
      setDisplay(next);

      if (revealCount >= text.length) {
        clearInterval(interval);
        setDisplay(text);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isHovered, text]);

  return <span className={className}>{display}</span>;
}

export default ScrambleText;
