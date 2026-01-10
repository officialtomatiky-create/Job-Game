'use client';
import { useState } from 'react';

export default function BillingPage() {
  const [amount, setAmount] = useState('');

  return (
    <div className="max-w-7xl mx-auto p-8" dir="rtl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">الاشتراك والتمويل</h1>
        <p className="text-gray-500 text-lg">قم بشحن رصيدك لتفعيل حملات التوظيف</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* بطاقة التحويل البنكي */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8 text-blue-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h2 className="text-xl font-bold">بيانات التحويل البنكي</h2>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">اسم البنك</p>
              <p className="font-bold text-slate-800 text-lg">مصرف الراجحي</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">اسم المستفيد</p>
              <p className="font-bold text-slate-800 text-lg">مؤسسة نقطة البرمجيات</p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-gray-50 rounded-xl relative group cursor-pointer hover:bg-blue-50 transition-colors">
                <p className="text-sm text-gray-500 mb-1">رقم الحساب</p>
                <p className="font-mono font-bold text-slate-800 dir-ltr">1234567890123456</p>
                <div className="absolute top-4 left-4 text-gray-300 group-hover:text-blue-500">
                   📋
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl relative group cursor-pointer hover:bg-blue-50 transition-colors">
              <p className="text-sm text-gray-500 mb-1">الآيبان (IBAN)</p>
              <p className="font-mono font-bold text-slate-800 dir-ltr">SA1234000000000000000000</p>
               <div className="absolute top-4 left-4 text-gray-300 group-hover:text-blue-500">
                   📋
                </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
              <span className="text-amber-500 mt-1">⚠️</span>
              <p className="text-sm text-amber-700 leading-relaxed">
                يرجى ملاحظة أن تفعيل الرصيد يتم يدوياً من قبل الإدارة بعد مراجعة إيصال التحويل، وتستغرق العملية من ساعة إلى 6 ساعات عمل.
              </p>
            </div>
          </div>
        </div>

        {/* بطاقة تأكيد الدفع */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-6">تأكيد عملية الدفع</h2>
          
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ المحول (SAR)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-right font-mono text-lg"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">إرفاق صورة الإيصال</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="text-4xl mb-3 text-gray-300">📤</div>
                <p className="text-sm text-gray-500">اسحب الصورة هنا أو اضغط للاختيار</p>
              </div>
            </div>

            <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl">
              تأكيد العملية
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}