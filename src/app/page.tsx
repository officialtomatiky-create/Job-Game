import HeroSection from '@/components/HeroSection';
import SiteFooter from '@/components/SiteFooter'; 

export default function Home() {
  return (
    // 👇 التعديل: أضفنا text-white لأن الافتراضي أصبح أسود الآن
    <main className="min-h-screen flex flex-col bg-gray-900 text-white">
      
      <HeroSection />

      <div className="grow"></div>

      <SiteFooter />

    </main>
  );
}