'use client';

import { useState, useEffect } from 'react';
import { X, Coins, Save, RotateCcw } from 'lucide-react';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: any;
  onUpdate: (amount: number) => Promise<void>;
}

export default function QuotaModal({ isOpen, onClose, player, onUpdate }: QuotaModalProps) {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // إعادة تعيين القيمة عند فتح المودال
  useEffect(() => {
    if (player) {
      setAmount(player.wallet_total || 0);
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(Number(amount));
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <Coins size={20} className="text-yellow-300" />
            إدارة رصيد المحفظة
          </h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-1">اللاعب</p>
            <h4 className="font-bold text-lg text-slate-800">{player.name}</h4>
            <p className="text-xs text-gray-400 dir-ltr">{player.player_id}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
             <span className="text-sm text-gray-600">المستهلك حالياً:</span>
             <span className="font-mono font-bold text-red-500">{player.wallet_consumed}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">إجمالي الرصيد المتاح (Total Limit)</label>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-3 text-center text-2xl font-bold text-blue-600 bg-white border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all"
                min={player.wallet_consumed} // لا يمكن أن يكون الإجمالي أقل مما تم استهلاكه
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">رسالة</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              المتبقي الفعلي سيكون: {Math.max(0, amount - (player.wallet_consumed || 0))}
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            {loading ? <RotateCcw className="animate-spin" /> : <Save size={18} />}
            حفظ التغييرات
          </button>
        </form>
      </div>
    </div>
  );
}