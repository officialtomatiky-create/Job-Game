'use client';

import { useState } from 'react';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Loader2, X, User, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
// 1. استيراد عميل Supabase
import { createClient } from '@/lib/supabase/client';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPlayerModal({ isOpen, onClose }: AddPlayerModalProps) {
  const router = useRouter();
  // 2. تهيئة العميل
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !phone) {
        setError('يرجى ملء جميع الحقول');
        return;
    }

    setLoading(true);

    try {
      // 3. جلب معرف المستخدم الحالي (المالك)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('جلسة المستخدم منتهية، يرجى إعادة تسجيل الدخول');
        return;
      }

      // إرسال البيانات إلى محرك n8n
      const webhookUrl = 'https://n8n.dot.com.sa/webhook/create-player-basic';
      
      await axios.post(webhookUrl, {
        name: name,
        phone: phone,
        owner_id: user.id // 4. إرسال معرف المالك لربط اللاعب به
      });

      // نجاح العملية
      router.refresh(); 
      onClose(); 
      setName('');
      setPhone(''); 
      
    } catch (err: any) {
      console.error(err);
      setError('فشل الإنشاء، تأكد من تشغيل المحرك');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-in-center">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">إضافة لاعب جديد</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Player Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User size={16} className="text-blue-500"/>
                اسم اللاعب
              </label>
              <input 
                type="text" 
                placeholder="مثال: واتسابي الشخصي / واتساب الشغل.." 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone size={16} className="text-[#25D366]"/>
                رقم الواتساب (المعرف)
              </label>
              <div className="direction-ltr">
                <PhoneInput 
                  country={'sa'} 
                  value={phone} 
                  onChange={setPhone} 
                  containerClass="!w-full" 
                  inputClass="!w-full !h-[48px] !rounded-xl !border-gray-200 !bg-gray-50 focus:!bg-white"
                  buttonClass="!rounded-l-xl !bg-gray-50 !border-gray-200"
                />
              </div>
              <p className="text-xs text-gray-400">سيكون هذا الرقم هو معرف اللاعب في النظام.</p>
            </div>

            {/* Footer / Submit */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#2563eb] hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'إنشاء اللاعب'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}