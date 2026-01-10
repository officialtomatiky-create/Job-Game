'use client';

import { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export default function RejectReasonModal({ isOpen, onClose, onConfirm, isLoading }: RejectReasonModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-red-50 p-6 flex justify-between items-center border-b border-red-100">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={24} />
            <h3 className="font-bold text-lg">رفض الحملة</h3>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سبب الرفض (سيظهر للمستخدم)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none h-32 text-gray-700 bg-gray-50 focus:bg-white transition-colors"
              placeholder="مثال: صيغة الرسالة تخالف سياسات واتساب، يرجى التعديل..."
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isLoading}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الرفض...' : (
                <>
                  <Send size={18} className="rotate-180" />
                  تأكيد الرفض
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}