'use client';

import { useEffect, useState, useRef } from 'react'; // ✅ أضفنا useRef
import axios from 'axios';
import { X, Loader2, Copy, Check, Smartphone, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConnectPairingCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  playerPhone: string;
  playerName: string;
}

export default function ConnectPairingCodeModal({ isOpen, onClose, onBack, playerPhone, playerName }: ConnectPairingCodeModalProps) {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // ✅ مرجع للمؤقت لنتمكن من إيقافه
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  // ✅ دالة الجلب المعدلة لدعم التحديث الصامت
  const fetchPairingCode = async (isBackgroundRefresh = false) => {
    // لا تظهر اللودر إذا كان تحديثاً في الخلفية (صامت)
    if (!isBackgroundRefresh) setLoading(true);
    if (!isBackgroundRefresh) setError(''); // لا نخفي الخطأ القديم في التحديث الصامت إلا إذا نجح الجديد

    try {
      // نطلب التنظيف فقط إذا لم يكن تحديثاً تلقائياً
      const shouldCleanup = !isBackgroundRefresh;

      const res = await axios.post('/api/integration/get-pairing-code', {
        phone: playerPhone,
        cleanup: shouldCleanup
      });

      const data = res.data;
      const code = data.pairingCode || data.data?.pairingCode;

      if (code) {
        setPairingCode(code);
        if (isBackgroundRefresh) setError(''); // إزالة أي خطأ سابق عند النجاح
      } else {
        // في التحديث الصامت، لو فشل الجلب لا نزعج المستخدم ونبقي الكود القديم إن وجد
        if (!isBackgroundRefresh) throw new Error('لم يتم العثور على كود ربط.');
      }

    } catch (err: any) {
      console.error(err);
      if (!isBackgroundRefresh) {
        setError(err.response?.data?.error || 'فشل توليد كود الربط.');
      }
    } finally {
      if (!isBackgroundRefresh) setLoading(false);
    }
  };

  // ✅ useEffect الموحد: طلب أولي + مؤقت
  useEffect(() => {
    if (isOpen) {
      // 1. الطلب الأول (مع التنظيف والانتظار)
      fetchPairingCode(false);

      // 2. تشغيل العداد للتحديث كل 15 ثانية (بدون تنظيف)
      pollTimer.current = setInterval(() => {
        fetchPairingCode(true); // true = isBackgroundRefresh
      }, 15000);
    }

    // التنظيف عند الإغلاق
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [isOpen]);

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

          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 min-h-[250px] flex flex-col items-center justify-center relative">

            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-purple-600" size={40} />
                <span className="text-sm text-gray-400">جاري تجهيز اتصال آمن...</span>
                <span className="text-xs text-gray-300">(قد يستغرق بضع ثوانٍ)</span>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm font-medium px-4 w-full">
                <p className="mb-4">{error}</p>
                <button
                  onClick={() => fetchPairingCode(false)}
                  className="flex items-center justify-center gap-2 mx-auto text-gray-500 hover:text-gray-800 underline bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                >
                  <RefreshCw size={14} /> إعادة المحاولة يدوياً
                </button>
              </div>
            ) : pairingCode ? (
              <div className="w-full animate-in zoom-in duration-300">
                <div className="flex items-center justify-center gap-1 mb-6 flex-wrap" dir="ltr">
                  {pairingCode.split('').map((char, i) => (
                    <span key={i} className={`
                          w-8 h-10 flex items-center justify-center 
                          bg-white border shadow-sm rounded-lg 
                          text-xl font-bold text-slate-800
                          ${char === '-' ? 'border-transparent shadow-none w-4' : 'border-gray-200'}
                        `}>
                      {char}
                    </span>
                  ))}
                </div>

                <button
                  onClick={copyToClipboard}
                  className={`
                    flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-xl text-sm font-bold transition-all w-full shadow-lg
                    ${copied ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-purple-600 text-white hover:bg-purple-700'}
                  `}
                >
                  {copied ? <><Check size={18} /> تم النسخ بنجاح</> : <><Copy size={18} /> نسخ الرمز</>}
                </button>

                <p className="text-[10px] text-gray-400 mt-4">
                  صلاحية الرمز تنتهي قريباً، استخدمه فوراً
                </p>
              </div>
            ) : null}

          </div>

          {!loading && !error && (
            <div className="text-right mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-800 font-bold mb-2 flex items-center gap-1">
                💡 خطوات التفعيل:
              </p>
              <ol className="text-[11px] text-blue-700 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>افتح واتساب في هاتفك</li>
                <li>الإعدادات {'>'} الأجهزة المرتبطة</li>
                <li>اضغط <b>"ربط جهاز"</b></li>
                <li>اضغط <b>"الربط برقم الهاتف بدلاً من ذلك"</b></li>
                <li>أدخل الرمز الظاهر بالأعلى</li>
              </ol>
            </div>
          )}

          <button onClick={() => { onClose(); router.refresh(); }} className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline">
            تم الربط بنجاح؟ أغلق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}