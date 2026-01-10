'use client';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'warning' | 'info'; // لتغيير لون الأيقونة
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading, 
  title, 
  message, 
  confirmText = 'نعم، متابعة',
  variant = 'warning' 
}: ConfirmModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-70 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden scale-in-center border border-gray-100">
        
        <div className="p-6 text-center">
          {/* الأيقونة متغيرة اللون حسب النوع */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            variant === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'
          }`}>
            <AlertCircle size={28} />
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        </div>

        {/* الأزرار */}
        <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            إلغاء
          </button>
          
          <button 
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 px-4 text-white rounded-xl font-bold shadow-sm transition-all flex justify-center items-center gap-2 ${
               variant === 'warning' 
               ? 'bg-yellow-600 hover:bg-yellow-700 hover:shadow-yellow-500/20' 
               : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}