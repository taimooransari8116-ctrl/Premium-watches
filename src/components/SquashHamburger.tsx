import { motion } from "framer-motion";

interface SquashHamburgerProps {
  open: boolean;
  mobile?: boolean;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 20 };

export function SquashHamburger({ open, mobile = false }: SquashHamburgerProps) {
  const width = mobile ? 15 : 18;
  const height = mobile ? 10 : 12;
  const barHeight = mobile ? 1.2 : 1.5;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width, height }}
      aria-hidden="true"
    >
      <motion.span
        className="absolute left-0 w-full bg-white rounded-full"
        style={{ height: barHeight, top: 0 }}
        animate={
          open
            ? { top: height / 2 - barHeight / 2, rotate: 45 }
            : { top: 0, rotate: 0 }
        }
        transition={spring}
      />
      <motion.span
        className="absolute left-0 w-full bg-white rounded-full"
        style={{ height: barHeight, top: height / 2 - barHeight / 2 }}
        animate={open ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={spring}
      />
      <motion.span
        className="absolute left-0 w-full bg-white rounded-full"
        style={{ height: barHeight, bottom: 0 }}
        animate={
          open
            ? { bottom: height / 2 - barHeight / 2, rotate: -45 }
            : { bottom: 0, rotate: 0 }
        }
        transition={spring}
      />
    </div>
  );
}

export default SquashHamburger;
