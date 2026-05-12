import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { TerminalPreview } from "@/components/landing/TerminalPreview";
import { Movers } from "@/components/landing/Movers";
import { LiveTickers } from "@/components/landing/LiveTickers";
import { Features } from "@/components/landing/Features";
import { About } from "@/components/landing/About";
import { Manifesto } from "@/components/landing/Manifesto";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CtaBand } from "@/components/landing/CtaBand";
import { Footer } from "@/components/landing/Footer";
import { CosmicBackdrop } from "@/components/landing/CosmicBackdrop";

export default function LandingPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <CosmicBackdrop />
      <div className="relative z-10">
        <NavBar />
        <Hero />
        <TerminalPreview />
        <Movers />
        <LiveTickers />
        <Features />
        <About />
        <Manifesto />
        <Pricing />
        <FAQ />
        <CtaBand />
        <Footer />
      </div>
    </main>
  );
}
