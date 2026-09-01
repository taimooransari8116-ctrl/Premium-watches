import { useState } from "react";
import { motion } from "framer-motion";
import { SynapseXLogo } from "./SynapseXLogo";
import { SquashHamburger } from "./SquashHamburger";
import { ScrambleText } from "./ScrambleText";

interface NavbarProps {
  entranceComplete: boolean;
}

function scrollToY(y: number) {
  window.scrollTo({ top: y, behavior: "smooth" });
}

export function Navbar({ entranceComplete }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [downloadHovered, setDownloadHovered] = useState(false);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 h-20 w-full bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: entranceComplete ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="h-full w-full flex items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-2">
          <motion.div
            className={`hidden ${
              open ? "md:flex" : "sm:flex"
            } h-12 px-5 items-center gap-2 bg-white/15 backdrop-blur-md rounded-[14px] cursor-pointer`}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.22)" }}
            whileTap={{ scale: 0.98 }}
          >
            <SynapseXLogo size={18} className="text-white" />
            <span className="text-white text-[16px] font-medium tracking-tight">
              SynapseX
            </span>
          </motion.div>

          <motion.div
            className="flex sm:hidden h-9 items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-[10px] overflow-hidden"
            animate={{ width: open ? 0 : "auto", paddingLeft: open ? 0 : 14, paddingRight: open ? 0 : 14, opacity: open ? 0 : 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <SynapseXLogo size={14} className="text-white shrink-0" />
            <span className="text-white text-[13px] font-medium tracking-tight whitespace-nowrap">
              SynapseX
            </span>
          </motion.div>

          <motion.div
            className="hidden sm:flex h-12 items-center bg-white/15 backdrop-blur-md rounded-[14px] overflow-hidden"
            animate={{ width: open ? 290 : 48 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <motion.button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`flex items-center justify-center shrink-0 ${
                open
                  ? "w-9 h-9 rounded-[11px] bg-white/10 hover:bg-white/20 ml-1.5"
                  : "w-12 h-12 rounded-[14px]"
              }`}
              aria-label="Toggle menu"
            >
              <SquashHamburger open={open} />
            </motion.button>

            <div className="flex items-center gap-6 pl-4 pr-5">
              {["About", "Metrics"].map((label, i) => (
                <motion.button
                  key={label}
                  type="button"
                  initial={false}
                  animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
                  transition={{ duration: 0.3, delay: open ? 0.1 + i * 0.05 : 0 }}
                  onClick={() =>
                    scrollToY(window.innerHeight * (label === "About" ? 1 : 2))
                  }
                  onMouseEnter={() => setHoveredLink(label)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="text-[16px] font-normal text-white/85 hover:text-white whitespace-nowrap"
                >
                  <ScrambleText text={label} isHovered={hoveredLink === label} />
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="flex sm:hidden h-9 items-center bg-white/15 backdrop-blur-md rounded-[10px] overflow-hidden"
            animate={{ width: open ? "100%" : 40 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <motion.button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`flex items-center justify-center shrink-0 ${
                open ? "w-7 h-7 rounded-[8px] bg-white/10 ml-1" : "w-9 h-9 rounded-[10px]"
              }`}
              aria-label="Toggle menu"
            >
              <SquashHamburger open={open} mobile />
            </motion.button>
            <div className="flex items-center gap-4 pl-3 pr-3">
              {["About", "Metrics"].map((label, i) => (
                <motion.button
                  key={label}
                  type="button"
                  initial={false}
                  animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
                  transition={{ duration: 0.3, delay: open ? 0.1 + i * 0.05 : 0 }}
                  onClick={() => {
                    scrollToY(window.innerHeight * (label === "About" ? 1 : 2));
                    setOpen(false);
                  }}
                  className="text-[13px] font-normal text-white/85 whitespace-nowrap"
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.button
          type="button"
          className="h-9 sm:h-12 px-3.5 sm:px-6 bg-white rounded-full flex items-center gap-2 text-black"
          whileHover={{ scale: 1.03, backgroundColor: "#e2e2e6" }}
          whileTap={{ scale: 0.97 }}
          onMouseEnter={() => setDownloadHovered(true)}
          onMouseLeave={() => setDownloadHovered(false)}
        >
          <i className="bi bi-apple text-[16px]" />
          <ScrambleText
            text="Download"
            isHovered={downloadHovered}
            className="text-[14px] sm:text-[15px] font-medium"
          />
        </motion.button>
      </div>
    </motion.nav>
  );
}

export default Navbar;
