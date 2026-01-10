'use client';

import { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertCircle,
  User,
  ShieldCheck,
  PlayCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import RejectReasonModal from '@/components/admin/RejectReasonModal';
import InfoModal from '@/components/dashboard/InfoModal';

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Modals State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success'|'error' });

  // Fetch Data
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/requests/list?t=' + Date.now());
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handlers
  const handleApprove = async (playerId: string) => {
    setProcessingId(playerId);
    try {
      const res = await fetch('/api/admin/requests/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, action: 'approve' }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setInfoModal({ isOpen: true, title: 'تم التفعيل', message: 'أصبحت حالة اللاعب Active وسيبدأ المحرك بالعمل.', type: 'success' });
      fetchRequests(); // تحديث القائمة لإزالة الطلب المعالج
    } catch (error: any) {
      setInfoModal({ isOpen: true, title: 'خطأ', message: error.message, type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setRejectModalOpen(true);
  };

  const confirmReject = async (reason: string) => {
    if (!selectedPlayerId) return;
    setProcessingId(selectedPlayerId); // إظهار حالة التحميل في الخلفية إذا أردت
    
    try {
      const res = await fetch('/api/admin/requests/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: selectedPlayerId, action: 'reject', reason }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setRejectModalOpen(false);
      setInfoModal({ isOpen: true, title: 'تم الرفض', message: 'تم تحديث حالة اللاعب وتسجيل السبب.', type: 'success' });
      fetchRequests();
    } catch (error: any) {
      setInfoModal({ isOpen: true, title: 'خطأ', message: error.message, type: 'error' });
    } finally {
      setProcessingId(null);
      setSelectedPlayerId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <ShieldCheck className="text-blue-600" />
            طلبات التشغيل (Campaign Requests)
          </h1>
          <p className="text-gray-500">اللاعبون الذين طلبوا البدء وينتظرون إشارة الإطلاق.</p>
        </div>
        <button onClick={fetchRequests} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="p-12 text-center text-gray-400">جاري التحميل...</div>
        ) : requests.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400 text-center">
            <CheckCircle2 size={48} className="mb-4 text-green-100" />
            <h3 className="text-lg font-bold text-slate-600">لا توجد طلبات معلقة</h3>
            <p className="text-sm">جميع اللاعبين تمت معالجتهم أو لم يطلب أحد التشغيل بعد.</p>
          </div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">اللاعب / المالك</th>
                <th className="p-4">وقت الطلب</th>
                <th className="p-4 text-center">حالة المحفظة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-orange-50/20 transition-colors group">
                  
                  {/* Player Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{req.name}</p>
                        <p className="text-xs text-gray-400 font-mono" dir="ltr">{req.player_id}</p>
                        {req.owner && (
                          <p className="text-[10px] text-gray-500 mt-1">المالك: {req.owner.full_name}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="p-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-orange-400" />
                      {new Date(req.campaign_requested_at).toLocaleString('ar-EG')}
                    </div>
                  </td>

                  {/* Wallet Stats */}
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold font-mono">
                      {req.wallet_consumed} / {req.wallet_total}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleApprove(req.id)}
                        disabled={!!processingId}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-green-200 transition-all disabled:opacity-50 hover:-translate-y-0.5"
                      >
                        {processingId === req.id ? <RefreshCw className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                        موافقة وتشغيل
                      </button>
                      
                      <button 
                        onClick={() => handleRejectClick(req.id)}
                        disabled={!!processingId}
                        className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        رفض
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <RejectReasonModal 
        isOpen={rejectModalOpen} 
        onClose={() => setRejectModalOpen(false)} 
        onConfirm={confirmReject} 
        isLoading={processingId === selectedPlayerId}
      />

      <InfoModal 
        isOpen={infoModal.isOpen} 
        title={infoModal.title} 
        message={infoModal.message} 
        type={infoModal.type} 
        onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))} 
      />

    </div>
  );
}