'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { X, Loader2, RefreshCw, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConnectWaModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerPhone: string;
  playerName: string;
}

export default function ConnectWaModal({ isOpen, onClose, playerPhone, playerName }: ConnectWaModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0); 
  const router = useRouter();
  
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchQR = async (isBackgroundRefresh = false) => {
    // لا نعرض اللودر في التحديث الخلفي لعدم إزعاج المستخدم
    if (!isBackgroundRefresh) setLoading(true);
    setError('');

    try {
        // نرسل cleanup: true فقط إذا لم يكن تحديثاً في الخلفية (أي عند فتح المودال أو زر المحاولة)
        const res = await axios.post('/api/integration/get-qr', {
          phone: playerPhone,
          cleanup: !isBackgroundRefresh 
        });
        
        
      const responseData = res.data;

      // البحث عن base64
      const base64Data = responseData.base64 || responseData.data?.base64 || responseData.qrcode || responseData.code;
      
      // التحقق من حالة الاتصال
      const status = responseData.status || responseData.data?.instance?.status;
      const isConnected = status === 'open' || status === 'connected' ||
                          (responseData.success && !base64Data && !responseData.data?.pairingCode);

      if (isConnected) {
         setQrCode(null);
         setError('تم الربط بنجاح! ✅');
         if (pollTimer.current) clearInterval(pollTimer.current);
         setTimeout(() => {
             onClose();
             router.refresh();
         }, 2000);
         return;
      }

      if (base64Data) {
        setQrCode(base64Data);
      } else {
        if (!isBackgroundRefresh) setError('جاري تهيئة الاتصال... (في انتظار الرمز)');
      }

    } catch (err) {
      console.error(err);
      if (!isBackgroundRefresh) setError('فشل جلب الرمز.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && playerPhone) {
      fetchQR();
      pollTimer.current = setInterval(() => {
        fetchQR(true); 
      }, 15000); 
    }
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [isOpen, playerPhone, retryCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative">
        
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 z-10">
          <X size={24} />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <Smartphone size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-1">ربط حساب واتساب</h3>
          <p className="text-gray-500 text-sm mb-6">{playerName} ({playerPhone})</p>

          {/* تم تعديل min-h إلى 350px لزيادة الطول */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden">
            
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-green-600" size={40} />
                <span className="text-sm text-gray-400">جاري الاتصال بالسيرفر...</span>
              </div>
            ) : error && !qrCode ? (
              <div className="text-red-500 text-sm font-medium px-4">
                {error}
                <button onClick={() => setRetryCount(c => c + 1)} className="mt-4 flex items-center justify-center gap-2 mx-auto text-gray-500 hover:text-gray-800 underline">
                  <RefreshCw size={14} /> محاولة مرة أخرى
                </button>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center w-full h-full justify-between">
                
                {/* QR Code Image - تم زيادة max-h إلى 280px */}
                <div className="relative flex-1 w-full flex items-center justify-center">
                  <img 
                    src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} 
                    alt="QR Code" 
                    className="max-w-full max-h-[280px] object-contain rounded-lg transition-opacity duration-500" 
                  />
                </div>
                
                {/* رسالة التنبيه في الأسفل */}
                <div className="mt-4 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100 w-full text-center">
                  <p className="text-[11px] text-yellow-700 font-medium leading-relaxed">
                    قد لا ينجح الربط من أول مرة..
                    <br/>
                    حاول أكثر من مرة 🔄
                  </p>
                </div>
              </div>
            ) : null}

          </div>

          <p className="text-xs text-gray-400 mt-6">
            افتح واتساب في هاتفك {'>'} الأجهزة المرتبطة {'>'} ربط جهاز
          </p>
        </div>
      </div>
    </div>
  );
}