import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useReferral } from '../contexts/ReferralContext';

import { GlowBackground } from '../components/ui/GlowBackground';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { TrustedBy } from '../components/landing/TrustedBy';
import { VideoShowcase } from '../components/landing/VideoShowcase';
import { FeaturesTabs } from '../components/landing/FeaturesTabs';
import { BenefitsGrid } from '../components/landing/BenefitsGrid';
import { TestimonialsCarousel } from '../components/landing/TestimonialsCarousel';
import { AIPresentationSection } from '../components/landing/AIPresentationSection';
import PricingSection from '../components/landing/PricingSection';
import { FAQSection } from '../components/landing/FAQSection';
import { Footer } from '../components/landing/Footer';

export default function ReferralLandingModern() {
  const { username } = useParams<{ username: string }>();
  const { setReferralCode } = useReferral();

  useEffect(() => {
    const processReferral = async () => {
      if (!username) return;

      console.log('🎯 Processing referral for username:', username);

      // Vérifier que le username existe dans la base de données
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.rpc('get_user_by_username', {
            username_to_find: username
          });

          if (error) {
            console.error('❌ Error fetching user:', error);
            return;
          }

          if (!data || data.length === 0) {
            console.warn('⚠️ Username not found:', username);
            return;
          }

          const userProfile = data[0];
          console.log('✅ User found:', userProfile);

          // Stocker le username comme code de referral dans le contexte
          setReferralCode(username);

          // Stocker dans sessionStorage pour le register
          sessionStorage.setItem('referralUsername', username);
          
          console.log('✅ Referral processed and stored for username:', username);

        } catch (err) {
          console.error('❌ Unexpected error processing referral:', err);
        }
      }
    };

    processReferral();
  }, [username, setReferralCode]);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <GlowBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <TrustedBy />
          <VideoShowcase />
          <AIPresentationSection />
          <FeaturesTabs />
          <BenefitsGrid />
          <TestimonialsCarousel />
          <PricingSection />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

