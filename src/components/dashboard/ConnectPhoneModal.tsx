'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Loader2, Copy, Check, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConnectPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  playerPhone: string;
  playerName: string;
}

export default function ConnectPhoneModal({ isOpen, onClose, onBack, playerPhone, playerName }: ConnectPhoneModalProps) {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // جلب كود الربط عند فتح المودال
  useEffect(() => {
    if (isOpen && !pairingCode) {
      fetchPairingCode();
    }
  }, [isOpen]);

  const fetchPairingCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/integration/get-pairing-code', {
        phone: playerPhone,
        cleanup: true // لتسجيل الخروج أولاً وضمان نظافة الجلسة
      });

      if (res.data.pairingCode) {
        setPairingCode(res.data.pairingCode);
      } else {
        throw new Error('لم يتم استلام كود الربط من الخادم');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'فشل توليد كود الربط. تأكد من صحة الرقم.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative">
        
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 z-10">
          <X size={24} />
        </button>
        
        <button onClick={onBack} className="absolute top-4 right-4 text-sm text-gray-400 hover:text-blue-600 font-bold z-10">
          العودة
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
            <Smartphone size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-1">رمز الربط</h3>
          <p className="text-gray-500 text-sm mb-6">أدخل هذا الرمز في هاتفك</p>

          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 min-h-[250px] flex flex-col items-center justify-center">
            
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-purple-600" size={40} />
                <span className="text-sm text-gray-400">جاري الاتصال بـ Evo...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm font-medium">
                {error}
                <button onClick={fetchPairingCode} className="mt-4 block mx-auto text-blue-600 underline">حاول مرة أخرى</button>
              </div>
            ) : pairingCode ? (
              <div className="w-full">
                {/* عرض الكود */}
                <div className="flex items-center justify-center gap-2 mb-2" dir="ltr">
                    {pairingCode.split('').map((char, i) => (
                        <span key={i} className="w-8 h-10 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded text-xl font-bold text-slate-800">
                            {char}
                        </span>
                    ))}
                </div>

                <button 
                  onClick={copyToClipboard}
                  className="mt-4 flex items-center justify-center gap-2 mx-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all w-full"
                >
                  {copied ? <><Check size={16} /> تم النسخ</> : <><Copy size={16} /> نسخ الرمز</>}
                </button>
              </div>
            ) : null}

          </div>

          <div className="text-right mt-6 bg-blue-50 p-4 rounded-xl">
            <p className="text-xs text-blue-800 font-bold mb-2">كيفية الاستخدام:</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>افتح واتساب على هاتفك</li>
              <li>الإعدادات {'>'} الأجهزة المرتبطة</li>
              <li>اضغط "ربط جهاز"</li>
              <li>اضغط "الربط برقم الهاتف بدلاً من ذلك"</li>
              <li>أدخل الرمز الظاهر بالأعلى</li>
            </ol>
          </div>
          
          <button onClick={() => { onClose(); router.refresh(); }} className="mt-4 text-xs text-gray-400 hover:text-gray-600">
             تم الربط؟ أغلق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}