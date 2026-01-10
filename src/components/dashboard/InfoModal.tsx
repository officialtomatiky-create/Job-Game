'use client';
import { CheckCircle, XCircle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error';
}

export default function InfoModal({ isOpen, onClose, title, message, type = 'success' }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    // ✅ تم تصحيح z-[80] إلى z-80
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-80 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden scale-in-center border border-gray-100">
        
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {type === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md ${
              type === 'success' 
                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' 
                : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
            }`}
          >
            موافق
          </button>
        </div>
      </div>
    </div>
  );
}