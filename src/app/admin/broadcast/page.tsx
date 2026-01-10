'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Send, Info, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

export default function BroadcastPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'info', expiresAfterHours: '24' });
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    const res = await fetch('/api/admin/broadcast/send');
    const data = await res.json();
    if(Array.isArray(data)) setNotifications(data);
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/admin/broadcast/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setLoading(false);
    setFormData({ ...formData, title: '', message: '' });
    fetchNotes();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Megaphone className="text-blue-600" />
          الإشعارات العامة (System Broadcast)
        </h1>
        <p className="text-gray-500">إرسال تنبيهات تظهر لجميع المستخدمين في لوحة التحكم الخاصة بهم.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSend} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الإشعار</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="تحديث هام للنظام..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع التنبيه</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none"
              >
                <option value="info">معلومة (أزرق)</option>
                <option value="warning">تحذير (أصفر)</option>
                <option value="error">خطأ/هام (أحمر)</option>
                <option value="success">نجاح (أخضر)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مدة الظهور (ساعات)</label>
              <select 
                value={formData.expiresAfterHours}
                onChange={(e) => setFormData({...formData, expiresAfterHours: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none"
              >
                <option value="6">6 ساعات</option>
                <option value="12">12 ساعة</option>
                <option value="24">24 ساعة (يوم)</option>
                <option value="48">48 ساعة (يومين)</option>
                <option value="168">أسبوع</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نص الرسالة</label>
              <textarea 
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none h-32 resize-none"
                placeholder="سيتم إيقاف النظام للصيانة..."
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 transition-all"
            >
              {loading ? 'جاري الإرسال...' : <><Send size={18} className="rotate-180" /> نشر الإشعار</>}
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-700">الإشعارات النشطة والسابقة</h3>
          {notifications.map((note) => (
            <div key={note.id} className={`p-4 rounded-xl border flex items-start gap-4 ${
              note.type === 'warning' ? 'bg-orange-50 border-orange-200' :
              note.type === 'error' ? 'bg-red-50 border-red-200' :
              note.type === 'success' ? 'bg-green-50 border-green-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className={`p-2 rounded-full bg-white shadow-sm shrink-0 ${
                 note.type === 'warning' ? 'text-orange-500' :
                 note.type === 'error' ? 'text-red-500' :
                 note.type === 'success' ? 'text-green-500' :
                 'text-blue-500'
              }`}>
                {note.type === 'warning' ? <AlertTriangle size={20} /> :
                 note.type === 'error' ? <XCircle size={20} /> :
                 note.type === 'success' ? <CheckCircle2 size={20} /> :
                 <Info size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800">{note.title}</h4>
                  <span className="text-xs text-gray-400">{new Date(note.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{note.message}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded border bg-white ${note.is_active ? 'text-green-600 border-green-200' : 'text-gray-400'}`}>
                    {note.is_active ? 'نشط' : 'أرشيف'}
                  </span>
                  {note.expires_at && <span className="text-gray-400">ينتهي: {new Date(note.expires_at).toLocaleString('ar-EG')}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}