'use client';

import { X, QrCode, Smartphone } from 'lucide-react';

interface ConnectMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'qr' | 'phone') => void;
}

export default function ConnectMethodModal({ isOpen, onClose, onSelectMethod }: ConnectMethodModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
        
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 z-10 transition-colors">
          <X size={24} />
        </button>

        <div className="p-8 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">ربط حساب واتساب</h3>
          <p className="text-gray-500 mb-8">اختر الطريقة المناسبة لك لربط الحساب</p>

          <div className="grid grid-cols-1 gap-4">
            {/* خيار QR Code */}
            <button 
              onClick={() => onSelectMethod('qr')}
              className="group flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <QrCode size={24} />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-700">مسح الرمز (QR Code)</h4>
                  <p className="text-xs text-gray-400">امسح الرمز باستخدام كاميرا الواتساب</p>
                </div>
              </div>
            </button>

            {/* خيار رقم الهاتف */}
            <button 
              onClick={() => onSelectMethod('phone')}
              className="group flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Smartphone size={24} />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-slate-800 group-hover:text-green-700">رقم الهاتف (Pairing Code)</h4>
                  <p className="text-xs text-gray-400">سيظهر لك كود تدخله في هاتفك</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}