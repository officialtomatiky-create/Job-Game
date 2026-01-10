'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// تأكد من استيراد العميل الصحيح (Client Component)
import { createClient } from '@/lib/supabase/client';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import OtpInput from 'react-otp-input';
import { Loader2, AlertCircle } from 'lucide-react';

// مكون أيقونة واتساب الرسمية
const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.6-16.5-14.7-27.6-32.8-30.8-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

export default function AuthPage() {
  const router = useRouter();
  // استخدام العميل الجديد من المكتبة المحدثة
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [showOtpModal, setShowOtpModal] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const userEmail = authMethod === 'email' ? email : `${phone}@phone.local`;

    try {
      if (isLogin) {
        // --- تسجيل الدخول ---
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password,
        });

        if (loginError) {
          // إذا كان الحساب غير مفعل (Email not confirmed)
          if (loginError.message.includes('Email not confirmed') && authMethod === 'whatsapp') {
            // نرسل الكود ونفتح النافذة
            await axios.post('/api/auth/send-otp', { phone });
            setShowOtpModal(true);
            return;
          }
          throw loginError;
        }
        
        // إذا نجح الدخول
        router.push('/dashboard');
        router.refresh();

      } else {
        // --- إنشاء حساب جديد ---
        if (password !== confirmPassword) throw new Error('كلمات المرور غير متطابقة');

        // 1. إنشاء الحساب في نظام Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userEmail,
          password,
          options: { data: { full_name: fullName, phone_number: phone } },
        });

        if (authError) throw authError;

        // 2. إرسال البيانات للسيرفر (ليقوم بالحفظ في قاعدة البيانات وإرسال الرسالة)
        await axios.post('/api/auth/send-otp', { 
          phone: authMethod === 'whatsapp' ? phone : null, 
          user_id: authData.user?.id, 
          full_name: fullName 
        });
        
        if (authMethod === 'whatsapp') {
          setShowOtpModal(true);
        } else {
          setError('تم إنشاء الحساب، يرجى تفعيل البريد الإلكتروني.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ ما');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. استدعاء API للتحقق وتفعيل الحساب في قاعدة البيانات
      const res = await axios.post('/api/auth/verify-otp', { identifier: phone, code: otp });

      if (res.data.success) {
        
        // 🔥🔥 الخطوة الحاسمة: تسجيل الدخول التلقائي 🔥🔥
        // هذا هو ما يزرع الـ Cookie في المتصفح ويسمح لك بعبور الـ Middleware
        const userEmail = authMethod === 'email' ? email : `${phone}@phone.local`;
        
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password, // نستخدم الباسورد المحفوظ في الـ state
        });

        if (loginError) {
            console.error('Auto login failed:', loginError);
            throw new Error('تم التفعيل ولكن فشل الدخول التلقائي. حاول تسجيل الدخول يدوياً.');
        }

        // 2. إغلاق النافذة والتوجيه
        setShowOtpModal(false);
        router.refresh(); // تحديث الصفحة ليتعرف الناف بار على المستخدم
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'كود التحقق خاطئ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">{isLogin ? 'تسجيل الدخول' : 'حساب جديد'}</h2>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-r-4 border-red-500 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
            <button 
              type="button" 
              onClick={() => setAuthMethod('whatsapp')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${authMethod === 'whatsapp' ? 'bg-white text-[#25D366] shadow-sm' : 'text-gray-400'}`}
            >
              <WhatsAppIcon /> واتساب
            </button>
            <button 
              type="button" 
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${authMethod === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
            >
              <span>📧 البريد</span>
            </button>
          </div>

          {!isLogin && (
            <input 
              type="text" 
              placeholder="الاسم الكامل" 
              required 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00a884] focus:bg-white" 
              value={fullName} 
              onChange={(e)=>setFullName(e.target.value)}
            />
          )}
          
          {authMethod === 'whatsapp' ? (
            <div className="direction-ltr">
              <PhoneInput 
                country={'sa'} 
                value={phone} 
                onChange={setPhone} 
                containerClass="!w-full" 
                inputClass="!w-full !h-[54px] !rounded-2xl !border-gray-200 !bg-gray-50"
              />
            </div>
          ) : (
            <input 
              type="email" 
              placeholder="البريد الإلكتروني" 
              required 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)}
            />
          )}

          <input 
            type="password" 
            placeholder="كلمة المرور" 
            required 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00a884]" 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)}
          />
          
          {!isLogin && (
            <input 
              type="password" 
              placeholder="تأكيد كلمة المرور" 
              required 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00a884]" 
              value={confirmPassword} 
              onChange={(e)=>setConfirmPassword(e.target.value)}
            />
          )}

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-[#00a884] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#008f6f] transition-all flex justify-center items-center"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'متابعة'}
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setError(''); }} 
          className="w-full text-center mt-8 text-sm text-gray-400 font-medium"
        >
          {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ دخول'}
        </button>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl">
            <div className="w-20 h-20 bg-[#DCF8C6] rounded-full flex items-center justify-center mx-auto mb-6">
              <WhatsAppIcon />
            </div>
            <h3 className="text-xl font-bold mt-2">تأكيد الرمز</h3>
            <p className="text-gray-500 text-sm mb-6">أدخل الرمز المرسل إلى {phone}+</p>
            <div className="flex justify-center mb-6" dir="ltr">
              <OtpInput 
                value={otp} 
                onChange={setOtp} 
                numInputs={4} 
                renderSeparator={<span className="w-4"></span>} 
                renderInput={(props: any) => <input {...props} className="w-14 h-16 border-2 border-gray-100 rounded-2xl text-2xl font-black text-center focus:border-[#00a884] outline-none"/>}
              />
            </div>
            <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full bg-[#00a884] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-green-100">
              {isLoading ? <Loader2 className="animate-spin" /> : 'تأكيد الحساب'}
            </button>
            <button onClick={() => setShowOtpModal(false)} className="mt-6 text-gray-400 text-sm hover:text-gray-600">إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
}