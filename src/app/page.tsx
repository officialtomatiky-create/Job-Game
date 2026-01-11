import HeroSection from '@/components/HeroSection';
import SiteFooter from '@/components/SiteFooter'; 

export default function Home() {
  return (
    // التعديل هنا: حذفنا bg-gray-50 وثبتنا bg-gray-900 لتكون الخلفية سوداء دائماً
    <main className="min-h-screen flex flex-col bg-gray-900">
      
      <HeroSection />

      <div className="grow"></div>

      <SiteFooter />

    </main>
  );
}