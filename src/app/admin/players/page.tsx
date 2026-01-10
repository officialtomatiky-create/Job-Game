'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  MoreVertical, 
  Ban, 
  Play, 
  Pause, 
  Coins, 
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import QuotaModal from '@/components/admin/QuotaModal';
import InfoModal from '@/components/dashboard/InfoModal';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [infoModal, setInfoModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success'|'error' });

  // جلب البيانات
  const fetchPlayers = async () => {
    setLoading(true);
    try {
      // نستخدم API القائمة الموجود مسبقاً أو ننشئ واحداً جديداً للأدمن
      // هنا سنستخدم API الأدمن المخصص الذي يفترض أنك أنشأته (أو نستخدم الـ client مباشرة)
      // للسرعة، سنطلب من API قائمة اللاعبين العادية (أو يمكن استخدام supabase client مباشرة هنا)
      const res = await fetch('/api/players/list?t=' + Date.now()); 
      // ملاحظة: الأفضل إنشاء /api/admin/players/list لجلب بيانات حساسة أكثر
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlayers(data);
        setFilteredPlayers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // البحث
  useEffect(() => {
    if (!search) {
      setFilteredPlayers(players);
    } else {
      setFilteredPlayers(players.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.player_id?.includes(search)
      ));
    }
  }, [search, players]);

  // تحديث الرصيد
  const handleQuotaUpdate = async (amount: number) => {
    if (!selectedPlayer) return;
    const res = await fetch('/api/admin/players/quota', {
      method: 'POST',
      body: JSON.stringify({ playerId: selectedPlayer.id, walletTotal: amount })
    });
    
    if (res.ok) {
      setInfoModal({ isOpen: true, title: 'تم بنجاح', message: 'تم تحديث رصيد اللاعب', type: 'success' });
      fetchPlayers();
    } else {
      setInfoModal({ isOpen: true, title: 'خطأ', message: 'فشل تحديث الرصيد', type: 'error' });
    }
  };

  // تنفيذ إجراء (حظر/إيقاف)
  const handleAction = async (playerId: string, action: string) => {
    if (!confirm(`هل أنت متأكد من تنفيذ الإجراء: ${action}؟`)) return;
    
    const res = await fetch('/api/admin/players/action', {
      method: 'POST',
      body: JSON.stringify({ playerId, action })
    });

    if (res.ok) {
      fetchPlayers();
    } else {
      alert('فشلت العملية');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Smartphone className="text-blue-600" />
            إدارة اللاعبين
          </h1>
          <p className="text-gray-500 mt-1">التحكم في الحسابات، الأرصدة، والصلاحيات</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو رقم الهاتف..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium">اللاعب</th>
                <th className="p-4 font-medium text-center">الحالة</th>
                <th className="p-4 font-medium text-center">الرصيد (Wallet)</th>
                <th className="p-4 font-medium text-center">واتساب</th>
                <th className="p-4 font-medium text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                  
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{player.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{player.player_id}</div>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      player.status === 'active' ? 'bg-green-100 text-green-700' :
                      player.status === 'banned' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {player.status}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-700">{player.wallet_consumed} / {player.wallet_total}</span>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, (player.wallet_consumed / (player.wallet_total || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                     {player.evo_connection_status === 'connected' ? 
                       <CheckCircle2 size={18} className="text-green-500 inline" /> : 
                       <XCircle size={18} className="text-gray-300 inline" />
                     }
                  </td>

                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => { setSelectedPlayer(player); setQuotaModalOpen(true); }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="تعديل الرصيد"
                    >
                      <Coins size={18} />
                    </button>
                    
                    {player.status === 'banned' ? (
                      <button 
                        onClick={() => handleAction(player.id, 'unban')}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="فك الحظر"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAction(player.id, 'ban')}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="حظر اللاعب"
                      >
                        <Ban size={18} />
                      </button>
                    )}

                    {player.status === 'active' && (
                       <button 
                       onClick={() => handleAction(player.id, 'pause')}
                       className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                       title="إيقاف مؤقت (Force Stop)"
                     >
                       <Pause size={18} />
                     </button>
                    )}
                     {player.status === 'paused' && (
                       <button 
                       onClick={() => handleAction(player.id, 'activate')}
                       className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                       title="استئناف"
                     >
                       <Play size={18} />
                     </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QuotaModal 
        isOpen={quotaModalOpen} 
        onClose={() => setQuotaModalOpen(false)} 
        player={selectedPlayer}
        onUpdate={handleQuotaUpdate}
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