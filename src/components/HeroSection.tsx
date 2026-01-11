'use client';

import { TypeAnimation } from 'react-type-animation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const BouncingDots = () => (
  <span className="inline-flex mx-1 translate-y-1"> 
    {/* تم تثبيت اللون الأبيض للنقاط */}
    <span className="animate-bounce delay-0 inline-block text-white text-3xl md:text-5xl lg:text-7xl leading-none">.</span>
    <span className="animate-bounce delay-100 inline-block text-white text-3xl md:text-5xl lg:text-7xl leading-none">.</span>
    <span className="animate-bounce delay-200 inline-block text-white text-3xl md:text-5xl lg:text-7xl leading-none">.</span>
  </span>
);

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  const [showDots, setShowDots] = useState(false);
  const [isFinalSentence, setIsFinalSentence] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    // التغيير الرئيسي: الخلفية أصبحت bg-gray-900 دائماً
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-gray-900">
      
      <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 backdrop-blur-xl shadow-sm">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 ml-2 animate-pulse"></span>
        نسخة تجريبية
      </div>

      <h1 className="w-full max-w-5xl mx-auto text-3xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-relaxed flex flex-col items-center justify-start h-[300px] md:h-[400px] pt-12 md:pt-16">
        <div className="inline-flex flex-wrap justify-center items-baseline relative w-full px-2">
          <span 
            className={`
              relative wrap-break-word transition-colors duration-300
              ${isFinalSentence 
                ? 'text-white' // تم تثبيت النص الأبيض للجملة النهائية
                : 'text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600'
              }
            `}
          >
            {mounted ? (
              <TypeAnimation
                sequence={[
                  'تبحث عن عمل؟', 2000, '', 
                  () => setIsFinalSentence(true), 
                  'شغل البوت', 
                  () => setShowDots(true), 1500, () => setShowDots(false),
                  'شغل البوت يقدمك في مئات الشركات', 
                  4000, '', 
                  () => setIsFinalSentence(false), 
                ]}
                wrapper="span"
                speed={50}
                deletionSpeed={70}
                repeat={Infinity}
                cursor={false} 
                style={{ display: 'inline', direction: 'rtl' }} 
              />
            ) : (
              <span>تبحث عن عمل؟</span>
            )}
          </span>
          {showDots && <BouncingDots />}
        </div>
      </h1>

      {/* تم تثبيت لون النص الرمادي الفاتح للوصف */}
      <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-4 mb-10">
        منصة <span className="font-bold text-blue-600">Job Game</span> هي طريقك الأذكى للتوظيف. دع الأتمتة تقوم بالعمل الشاق، وركز أنت على المقابلات الشخصية.
      </p>

      {/* --- منطقة الأزرار --- */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center px-4">
        {/* زر إنشاء حساب جديد (لم يتغير لأنه أصلاً أزرق) */}
        <Link 
          href="/auth?mode=signup"
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all duration-300"
        >
          أنشئ حساب جديد
        </Link>

        {/* زر الدخول: تم تعديله ليكون غامقاً دائماً */}
        <Link 
          href="/auth"
          className="w-full sm:w-auto px-8 py-4 bg-gray-800 text-gray-200 font-bold rounded-xl border border-gray-700 hover:bg-gray-700 hover:text-blue-400 transition-all duration-300"
        >
          دخول
        </Link>
      </div>

    </section>
  );
};

export default HeroSection;