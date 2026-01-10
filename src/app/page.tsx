import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-black">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {/* Header content if needed */}
      </div>

      <div className="relative flex place-items-center flex-col text-center gap-6">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600 pb-2">
          حول واتساب إلى <br /> ماكينة توظيف ذكية
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl">
          قم بإدارة مئات المتقدمين للوظائف تلقائياً عبر محركات n8n المتطورة. اربط جداولك، أطلق حملتك، ودع Job_Game تقوم بالباقي.
        </p>

        <div className="flex gap-4 mt-8">
          <Link 
            href="/auth" 
            className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            ابدأ تجربتك المجانية ←
          </Link>
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            مشاهدة العرض التجريبي
          </Link>
        </div>
      </div>

      <div className="mt-32 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">لماذا تختار Job_Game؟</h2>
        <p className="text-gray-500">حلول متكاملة لفرق الموارد البشرية والشركات الناشئة</p>
      </div>
    </main>
  );
}