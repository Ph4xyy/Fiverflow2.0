import { GlowBackground } from '../components/ui/GlowBackground';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { TrustedBy } from '../components/landing/TrustedBy';
import { VideoShowcase } from '../components/landing/VideoShowcase';
import { FeaturesTabs } from '../components/landing/FeaturesTabs';
import { BenefitsGrid } from '../components/landing/BenefitsGrid';
import { TestimonialsCarousel } from '../components/landing/TestimonialsCarousel';
import { CTASection } from '../components/landing/CTASection';
import { FAQSection } from '../components/landing/FAQSection';
import { Footer } from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <GlowBackground />
      <Navbar />
      <main>
        <HeroSection />
        <TrustedBy />
        <VideoShowcase />
        <FeaturesTabs />
        <BenefitsGrid />
        <TestimonialsCarousel />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}

