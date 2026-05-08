import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { CtaBand } from "@/components/landing/CtaBand";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="bg-black text-ink min-h-screen">
      <NavBar />
      <Hero />
      <Stats />
      <Features />
      <Pricing />
      <CtaBand />
      <Footer />
    </main>
  );
}
