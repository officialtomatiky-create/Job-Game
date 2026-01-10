'use client';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, loading }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    // تم تعديل z-[70] إلى z-70 بناءً على اقتراح المصحح
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-70 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border-2 border-red-100 overflow-hidden scale-in-center">
        
        {/* رأس المودال */}
        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-700">تحذير: إجراء نهائي وخطير!</h3>
        </div>

        {/* محتوى التحذير */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed font-medium">
            أنت على وشك حذف هذا اللاعب بشكل نهائي. يرجى الانتباه لما يلي:
          </p>
          
          <ul className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <li className="flex items-center gap-2">
              <span className="text-red-500">●</span> سيتم فصل وحذف إنستانس الواتساب فوراً.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">●</span> ستُحذف جميع الحملات الإعلانية المرتبطة.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500 font-bold">●</span> سيضيع الرصيد المشحون (Wallet) ولن يسترد.
            </li>
          </ul>

          <p className="text-xs text-gray-400 text-center mt-2">
            هل أنت متأكد 100% أنك تريد المتابعة؟ لا يمكن التراجع عن هذا القرار.
          </p>
        </div>

        {/* الأزرار */}
        <div className="p-4 bg-gray-50 flex gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            تراجع (آمن)
          </button>
          
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg hover:shadow-red-500/30 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'نعم، احذف كل شيء'}
          </button>
        </div>
      </div>
    </div>
  );
}