'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Wifi, WifiOff, RefreshCw, Smartphone, Briefcase, 
  Settings, Edit3, PauseCircle, Unplug, Trash2 
} from 'lucide-react';

// استيراد المودالات
import AddPlayerModal from '@/components/AddPlayerModal'; 
import ConnectWaModal from '@/components/dashboard/ConnectWaModal';
import EditNameModal from '@/components/dashboard/EditNameModal'; 
import DeleteConfirmModal from '@/components/dashboard/DeleteConfirmModal';
import ConfirmModal from '@/components/dashboard/ConfirmModal';
import InfoModal from '@/components/dashboard/InfoModal';

// ✅ استيراد المودالات الجديدة لنظام الربط
import ConnectMethodModal from '@/components/dashboard/ConnectMethodModal';
import ConnectPhoneModal from '@/components/dashboard/ConnectPhoneModal';

export default function Dashboard() {
  const supabase = createClient();
  
  // --- States ---
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // الحذف
  const [playerToDelete, setPlayerToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // التأكيد العام (فصل / إيقاف)
  const [genericConfirm, setGenericConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    action: () => Promise<void>;
    isLoading: boolean;
    variant?: 'warning' | 'info';
  }>({
    isOpen: false, title: '', message: '', confirmText: '', action: async () => {}, isLoading: false
  });

  // رسائل المعلومات
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean; 
    title: string; 
    message: string; 
    type: 'success' | 'error';
  }>({
    isOpen: false, title: '', message: '', type: 'success'
  });

  // ✅ New Connection Logic States (استبدال الستيت القديمة)
  const [connectStep, setConnectStep] = useState<'none' | 'method' | 'qr' | 'phone'>('none');
  const [selectedPlayerForConnect, setSelectedPlayerForConnect] = useState<any>(null);

  // --- Helpers ---
  
  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!event.target.closest('.player-settings-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // دالة عرض الرسائل
  const showMessage = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setInfoModal({ isOpen: true, title, message, type });
  };

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/players/list?t=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setPlayers(data);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Action Handlers (Logic) ---

  // 1. قطع الاتصال
  const executeDisconnect = async (player: any) => {
    try {
      const res = await fetch('/api/integration/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: player.player_id })
      });
      
      const data = await res.json();

      if (res.ok) {
        setPlayers(prev => prev.map(p => p.id === player.id ? {...p, evo_connection_status: 'disconnected'} : p));
        setGenericConfirm(prev => ({ ...prev, isOpen: false }));
        showMessage('تم بنجاح', 'تم قطع اتصال الواتساب بنجاح', 'success');
      } else {
        throw new Error(data.error || 'فشل قطع الاتصال');
      }
    } catch (e: any) {
      setGenericConfirm(prev => ({ ...prev, isOpen: false }));
      showMessage('خطأ', e.message || 'خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  // 2. إيقاف الحملة
  const executePauseCampaign = async (player: any) => {
    try {
      const res = await fetch('/api/campaign/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, status: 'paused' })
      });

      const data = await res.json();

      if (res.ok) {
        setPlayers(prev => prev.map(p => p.id === player.id ? {...p, status: 'paused'} : p));
        setGenericConfirm(prev => ({ ...prev, isOpen: false }));
        showMessage('تم بنجاح', 'تم إيقاف الحملة بنجاح', 'success');
      } else {
        throw new Error(data.error || 'فشل إيقاف الحملة');
      }
    } catch (error: any) {
      setGenericConfirm(prev => ({ ...prev, isOpen: false }));
      showMessage('خطأ', error.message || 'حدث خطأ أثناء الاتصال بالسيرفر', 'error');
    }
  };

  // 3. الحذف النهائي
  const confirmDeletePlayer = async () => {
    if (!playerToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch('/api/integration/delete-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerId: playerToDelete.id,            
          instanceName: playerToDelete.player_id 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشلت عملية الحذف');
      }

      setPlayerToDelete(null); 
      // تحديث القائمة فوراً
      setPlayers(prev => prev.filter(p => p.id !== playerToDelete.id));
      showMessage('تم الحذف', 'تم حذف اللاعب بنجاح', 'success');

    } catch (err: any) {
      console.error(err);
      setPlayerToDelete(null); 
      showMessage('خطأ في الحذف', err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- القائمة المنسدلة ---
  const handleAction = (action: string, player: any) => {
    setActiveMenuId(null); 

    if (action === 'edit_name') {
      setEditingPlayer(player);
    }

    if (action === 'pause_campaign') {
      setGenericConfirm({
        isOpen: true,
        title: 'إيقاف الحملة',
        message: 'هل أنت متأكد من رغبتك في إيقاف الحملة لهذا اللاعب مؤقتاً؟',
        confirmText: 'نعم، إيقاف',
        variant: 'warning',
        isLoading: false,
        action: () => executePauseCampaign(player)
      });
    }

    if (action === 'disconnect') {
      setGenericConfirm({
        isOpen: true,
        title: 'قطع اتصال الواتساب',
        message: 'هل أنت متأكد من رغبتك في قطع الاتصال؟ سيتوقف البوت عن العمل.',
        confirmText: 'نعم، قطع الاتصال',
        variant: 'warning',
        isLoading: false,
        action: () => executeDisconnect(player)
      });
    }

    if (action === 'delete') {
      setPlayerToDelete(player);
    }
  };

  const handleGenericConfirm = async () => {
    setGenericConfirm(prev => ({ ...prev, isLoading: true }));
    await genericConfirm.action();
    setGenericConfirm(prev => ({ ...prev, isLoading: false }));
  };

  // --- Realtime ---
  useEffect(() => {
    fetchPlayers();
    const channel = supabase.channel('realtime-players-dashboard')
      .on('postgres_changes', { event: '*', schema: 'job_game', table: 'players' }, (payload) => {
         if (payload.eventType === 'DELETE') {
           setPlayers(current => current.filter(p => p.id !== payload.old.id));
         } else if (payload.eventType === 'INSERT') {
           fetchPlayers();
         } else if (payload.eventType === 'UPDATE') {
           setPlayers(current => current.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
         }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  // --- Stats Calculation ---
  const stats = {
    totalPlayers: players.length,
    totalSent: players.reduce((acc, p) => acc + (p.stats?.total_sent || 0), 0),
    avgResponse: players.length > 0 
      ? Math.round(players.reduce((acc, p) => acc + (p.stats?.bottleneck || 0), 0) / players.length * 100) 
      : 0
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-right" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
        >
          <span>+</span> إضافة لاعب جديد
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">نظام Job_Game</h1>
          <p className="text-gray-500 mt-1">إدارة حسابات الواتساب وحملات التوظيف الذكية</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">إجمالي اللاعبين</h3>
          <p className="text-4xl font-bold text-slate-800">{stats.totalPlayers}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">الرسائل المرسلة</h3>
          <p className="text-4xl font-bold text-green-600">{stats.totalSent}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">معدل الاستجابة</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.avgResponse}%</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">الحسابات النشطة (Instances)</h2>
          <button onClick={() => fetchPlayers()} className="text-gray-400 hover:text-blue-600 transition-colors p-2" title="تحديث يدوي">
            <RefreshCw size={18} />
          </button>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">جاري تحميل البيانات...</div>
        ) : players.length === 0 ? (
          <div className="p-12 text-center text-gray-400">لا يوجد لاعبين حالياً. قم بإضافة أول لاعب!</div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4 font-medium">اللاعب</th>
                <th className="p-4 font-medium text-center">حالة الاتصال (Whatsapp)</th>
                <th className="p-4 font-medium text-center">حالة الحملة</th>
                <th className="p-4 font-medium">المرحلة</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Player Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                        <Smartphone size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{player.name || player.player_id}</p>
                        <p className="text-xs text-gray-400" dir="ltr">{player.player_phonenumber || player.player_id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Connection Status - ✅ تم تحديث هذا الجزء */}
                  <td className="p-4 text-center">
                    {player.evo_connection_status?.trim() === 'connected' ? (
                      <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-green-100 text-green-700 border border-green-200 cursor-default">
                        <Wifi size={14} /> متصل
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          // تعيين اللاعب المحدد وفتح مودال اختيار الطريقة
                          setSelectedPlayerForConnect(player);
                          setConnectStep('method');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all cursor-pointer shadow-sm"
                      >
                        <WifiOff size={14} /> ربط الحساب
                      </button>
                    )}
                  </td>

                  {/* Campaign Status */}
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      player.status === 'active' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {player.status === 'active' ? 'نشطة' : 'متوقفة'}
                    </span>
                  </td>

                  {/* Phase */}
                  <td className="p-4">
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">
                      {player.current_phase || 'Growth'}
                    </span>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="p-4 player-settings-container">
                    <div className="flex items-center gap-3 relative">
                      <Link 
                        href={`/dashboard/campaign/${player.player_id}`}
                        className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                      >
                        <Briefcase size={14} /> إدارة الحملة
                      </Link>

                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === player.id ? null : player.id)}
                          className={`p-2 rounded-lg transition-colors ${activeMenuId === player.id ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <Settings size={18} />
                        </button>

                        {activeMenuId === player.id && (
                          <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-left">
                            
                            <button onClick={() => handleAction('edit_name', player)} className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                              <Edit3 size={16} className="text-blue-500" /> تعديل الاسم
                            </button>

                            <button 
                              onClick={() => handleAction('disconnect', player)}
                              disabled={player.evo_connection_status?.trim() !== 'connected'}
                              className={`w-full text-right px-4 py-3 text-sm flex items-center gap-2 transition-colors ${
                                player.evo_connection_status?.trim() !== 'connected' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Unplug size={16} className={player.evo_connection_status?.trim() !== 'connected' ? 'text-gray-300' : 'text-orange-500'} /> قطع الاتصال
                            </button>

                            <button 
                              onClick={() => handleAction('pause_campaign', player)}
                              disabled={player.status !== 'active'}
                              className={`w-full text-right px-4 py-3 text-sm flex items-center gap-2 transition-colors ${
                                player.status !== 'active' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <PauseCircle size={16} className={player.status !== 'active' ? 'text-gray-300' : 'text-yellow-500'} /> إيقاف الحملة
                            </button>

                            <div className="border-t border-gray-100 my-1"></div>

                            <button onClick={() => handleAction('delete', player)} className="w-full text-right px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                              <Trash2 size={16} /> حذف اللاعب
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- Modals Section --- */}
      
      <AddPlayerModal 
        isOpen={showAddModal} 
        onClose={() => { setShowAddModal(false); fetchPlayers(); }} 
      />
      
      {/* ✅ مودال اختيار طريقة الربط (الجديد) */}
      <ConnectMethodModal 
        isOpen={connectStep === 'method'}
        onClose={() => setConnectStep('none')}
        onSelectMethod={(method) => setConnectStep(method)} // الانتقال إلى qr أو phone
      />

      {/* ✅ مودال الـ QR (موجود سابقاً لكن تم تعديل التحكم به) */}
      <ConnectWaModal 
        isOpen={connectStep === 'qr'} 
        onClose={() => setConnectStep('none')} 
        playerPhone={selectedPlayerForConnect?.player_id || ''} 
        playerName={selectedPlayerForConnect?.name || ''} 
      />

      {/* ✅ مودال الـ Phone/Code (الجديد) */}
      {selectedPlayerForConnect && (
        <ConnectPhoneModal 
          isOpen={connectStep === 'phone'}
          onClose={() => setConnectStep('none')}
          onBack={() => setConnectStep('method')}
          playerPhone={selectedPlayerForConnect.player_id} // استخدام player_id كمعرف الاتصال
          playerName={selectedPlayerForConnect.name}
        />
      )}
      
      {editingPlayer && (
        <EditNameModal 
          isOpen={!!editingPlayer} 
          onClose={() => setEditingPlayer(null)} 
          player={editingPlayer} 
          onSuccess={() => fetchPlayers()} 
        />
      )}

      {/* مودال التأكيد العام (Generic Confirm) */}
      <ConfirmModal 
        isOpen={genericConfirm.isOpen}
        title={genericConfirm.title}
        message={genericConfirm.message}
        confirmText={genericConfirm.confirmText}
        variant={genericConfirm.variant}
        onClose={() => setGenericConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleGenericConfirm}
        loading={genericConfirm.isLoading}
      />

      {/* مودال الحذف الخاص (Delete Confirm) */}
      <DeleteConfirmModal 
        isOpen={!!playerToDelete} 
        onClose={() => setPlayerToDelete(null)} 
        onConfirm={confirmDeletePlayer} 
        loading={isDeleting} 
      />

      {/* مودال المعلومات (Info/Success/Error) */}
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