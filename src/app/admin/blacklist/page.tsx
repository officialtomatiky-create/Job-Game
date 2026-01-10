'use client';

import { useState, useEffect } from 'react';
import { ShieldBan, Plus, Trash2, Search, AlertOctagon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function BlacklistPage() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPhone, setNewPhone] = useState('');
  const [reason, setReason] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchBlacklist = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/blacklist');
    const data = await res.json();
    if (Array.isArray(data)) setNumbers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone) return;
    setAdding(true);

    const res = await fetch('/api/admin/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: newPhone, reason })
    });

    const data = await res.json();
    setAdding(false);

    if (res.ok) {
      setNewPhone('');
      setReason('');
      fetchBlacklist();
    } else {
      alert(data.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا الرقم من الحظر؟')) return;
    await fetch(`/api/admin/blacklist?id=${id}`, { method: 'DELETE' });
    fetchBlacklist();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <ShieldBan className="text-red-600" />
            القائمة السوداء (Global Blacklist)
          </h1>
          <p className="text-gray-500">الأرقام المدرجة هنا لن تستلم أي رسائل من النظام نهائياً.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="text-blue-600" size={20} /> إضافة رقم جديد
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input 
                  type="text" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="201xxxxxxxxx"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السبب (اختياري)</label>
                <input 
                  type="text" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="طلب إلغاء اشتراك، شكوى..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={adding}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
              >
                {adding ? 'جاري الإضافة...' : 'حظر الرقم'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">الرقم</th>
                  <th className="p-4">السبب</th>
                  <th className="p-4">تاريخ الحظر</th>
                  <th className="p-4 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {numbers.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-700 dir-ltr">{item.phone_number}</td>
                    <td className="p-4 text-sm text-gray-600">{item.reason || '-'}</td>
                    <td className="p-4 text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {numbers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      القائمة نظيفة، لا يوجد أرقام محظورة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}