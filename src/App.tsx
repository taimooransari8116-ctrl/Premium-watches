import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { CinematicSection } from "./components/CinematicSection";
import { MetricsSection } from "./components/MetricsSection";
import { TechnologySection } from "./components/TechnologySection";
import { ArchitectureSection } from "./components/ArchitectureSection";
import { Footer } from "./components/Footer";
import { StoreApp } from "./store/StoreApp";
import { AdminPanel } from "./store/AdminPanel";

type View = "landing" | "store" | "admin";

// The landing page below is unchanged from the original SynapseX build —
// every component it renders (Navbar, HeroSection, CinematicSection,
// MetricsSection, TechnologySection, ArchitectureSection, Footer) is
// untouched. This wrapper just adds a way to reach the new Auxoro store.
function Landing({
  entranceComplete,
  onEnterStore,
}: {
  entranceComplete: boolean;
  onEnterStore: () => void;
}) {
  return (
    <div style={{ fontFamily: '"Space Mono", monospace' }} className="bg-black relative">
      <Navbar entranceComplete={entranceComplete} />
      <HeroSection entranceComplete={entranceComplete} />
      <CinematicSection />
      <MetricsSection />
      <TechnologySection />
      <ArchitectureSection />
      <Footer />

      {/* New: entry point into the Auxoro store — doesn't touch any
          existing landing component, just sits on top of them. */}
      <button
        onClick={onEnterStore}
        className="fixed bottom-6 right-5 z-[60] h-12 px-6 rounded-full bg-white text-black text-[13px] font-medium shadow-xl"
        style={{ fontFamily: '"Space Mono", monospace' }}
      >
        Shop Auxoro →
      </button>
    </div>
  );
}

function App() {
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [view, setView] = useState<View>("landing");

  useEffect(() => {
    const timeout = setTimeout(() => setEntranceComplete(true), 800);
    return () => clearTimeout(timeout);
  }, []);

  if (view === "store") {
    return <StoreApp onEnterAdmin={() => setView("admin")} onBackToLanding={() => setView("landing")} />;
  }

  if (view === "admin") {
    return <AdminPanel onExit={() => setView("store")} />;
  }

  return <Landing entranceComplete={entranceComplete} onEnterStore={() => setView("store")} />;
}

export default App;
