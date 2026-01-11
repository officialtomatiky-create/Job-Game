import HeroSection from '@/components/HeroSection';
// استيراد الملف بالاسم الجديد
import SiteFooter from '@/components/SiteFooter'; 

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      
      <HeroSection />

      <div className="grow"></div>

      {/* استخدام المكون بالاسم الجديد */}
      <SiteFooter />

    </main>
  );
}