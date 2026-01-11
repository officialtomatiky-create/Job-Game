// تم تثبيت الألوان الغامقة (Dark Colors) وإزالة الألوان الفاتحة
const SiteFooter = () => {
  const getMakkahYear = () => {
    try {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        timeZone: 'Asia/Riyadh'
      });
    } catch (e) {
      return new Date().getFullYear().toString();
    }
  };

  return (
    // 1. الخلفية: bg-gray-900 (بدلاً من bg-gray-50)
    // 2. الحدود: border-gray-800 (بدلاً من border-gray-200)
    <footer className="w-full py-6 mt-auto border-t border-gray-800 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        {/* 3. النص: text-gray-400 (لضمان وضوحه على الخلفية السوداء) */}
        <p className="text-sm text-gray-400 font-medium font-cairo">
          الحقوق محفوظة لشركة <span className="text-blue-600 font-bold">tomatiky</span> &copy; {getMakkahYear()}
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;