// تم تغيير اسم الدالة من Footer إلى SiteFooter
const SiteFooter = () => {
  // دالة للحصول على السنة بتوقيت مكة المكرمة
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
    <footer className="w-full py-6 mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium font-cairo">
          الحقوق محفوظة لشركة <span className="text-blue-600 font-bold">tomatiky</span> &copy; {getMakkahYear()}
        </p>
      </div>
    </footer>
  );
};

// تصدير باسم SiteFooter
export default SiteFooter;