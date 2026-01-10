'use client';

import { useState } from 'react';
import { Loader2, X, User } from 'lucide-react';

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: any;
  onSuccess: () => void;
}

export default function EditNameModal({ isOpen, onClose, player, onSuccess }: EditNameModalProps) {
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState(player?.name || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // ✅ تم تحديث الرابط هنا ليتطابق مع المسار الجديد
      const res = await fetch('/api/players/NameUpdate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: player.id,
          name: newName
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل تحديث الاسم');
      }

      onSuccess();
      onClose();

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-60 animate-in zoom-in-95">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">تعديل اسم اللاعب</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">الاسم الجديد</label>
            <div className="relative">
                <User size={18} className="absolute right-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="أدخل الاسم الجديد"
                  required
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition-all shadow-md hover:shadow-blue-500/20 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'حفظ التغييرات'}
          </button>
        </form>
      </div>
    </div>
  );
}