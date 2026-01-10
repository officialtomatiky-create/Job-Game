'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Loader2, 
  History, 
  RefreshCw,
  FileText,
  Search,
  X,
  UserCheck,
  Mail,
  Smartphone
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// تعريف نوع البيانات لتسهيل التعامل مع العلاقات
interface Player {
  id: string;
  name: string;
  player_id: string;
  owner?: {
    full_name: string;
    email: string;
    phone_number: string;
  };
}

export default function AudienceInjectionPage() {
  const supabase = createClient();
  
  // --- States ---
  const [players, setPlayers] = useState<Player[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  
  // Search & Selection States (New)
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form States
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error' | null, message: string}>({ type: null, message: '' });

  // --- Data Fetching ---
  
  // 1. جلب اللاعبين مع بيانات المالك
  const fetchPlayers = async () => {
    // نستخدم التوسعة (Join) لجلب بيانات المستخدم المالك عبر owner_id
    const { data, error } = await supabase
      .schema('job_game')
      .from('players')
      .select(`
        id, 
        name, 
        player_id,
        owner:users!owner_id (full_name, email, phone_number) 
      `)
      .neq('status', 'banned')
      .order('created_at', { ascending: false });
    
    if (data) setPlayers(data as any);
    if (error) console.error('Error fetching players:', error);
  };

  const fetchBatches = async () => {
    const { data } = await supabase
      .schema('job_game')
      .from('audience_batches')
      .select(`*, players (name, player_id)`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setBatches(data);
  };

  useEffect(() => {
    fetchPlayers();
    fetchBatches();

    // إغلاق القائمة عند النقر خارجها
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const channel = supabase.channel('audience_updates')
      .on('postgres_changes', { event: '*', schema: 'job_game', table: 'audience_batches' }, () => fetchBatches())
      .subscribe();

    return () => { 
      document.removeEventListener('mousedown', handleClickOutside);
      supabase.removeChannel(channel); 
    };
  }, []);

  // --- Handlers ---

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !file) return;

    setUploading(true);
    setUploadStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('playerId', selectedPlayer.id);

    try {
      const res = await fetch('/api/admin/audience/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الرفع');

      setUploadStatus({ type: 'success', message: 'تم رفع الملف بنجاح! جاري المعالجة...' });
      setFile(null);
      fetchBatches();
    } catch (error: any) {
      setUploadStatus({ type: 'error', message: error.message });
    } finally {
      setUploading(false);
    }
  };

  // فلترة اللاعبين بناءً على البحث
  const filteredPlayers = players.filter(p => 
    p.player_id.includes(searchTerm) || 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setSearchTerm(player.player_id); // نضع الرقم في الحقل
    setIsDropdownOpen(false);
    setUploadStatus({ type: null, message: '' });
  };

  const clearSelection = () => {
    setSelectedPlayer(null);
    setSearchTerm('');
    setFile(null);
  };

  // دالة مساعدة لحالة الدفعة (كما هي)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> مكتمل</span>;
      case 'processing': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> معالجة</span>;
      case 'queued': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">في الانتظار</span>;
      case 'failed': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1"><AlertTriangle size={12} /> فشل</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <UploadCloud className="text-blue-600" />
            حقن الجمهور (Audience Injection)
          </h1>
          <p className="text-gray-500">البحث برقم الهاتف أو الاسم لرفع الملفات بدقة.</p>
        </div>
        <button onClick={() => { fetchPlayers(); fetchBatches(); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Smart Upload Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <UserCheck className="text-green-600" size={20} />
              تحديد اللاعب والمالك
            </h3>
            
            <form onSubmit={handleUpload} className="space-y-6">
              
              {/* 1. Smart Search Input */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">ابحث عن اللاعب (الرقم أو الاسم)</label>
                <div className="relative">
                  <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    className={`w-full p-3 pr-10 border rounded-xl outline-none transition-all ${
                      selectedPlayer ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                    placeholder="مثال: 201xxxx أو اسم اللاعب..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                      if (selectedPlayer && e.target.value !== selectedPlayer.player_id) setSelectedPlayer(null); // إعادة التعيين عند التغيير
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  {searchTerm && (
                    <button 
                      type="button"
                      onClick={clearSelection}
                      className="absolute left-3 top-3.5 text-gray-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Dropdown Results */}
                {isDropdownOpen && searchTerm && !selectedPlayer && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredPlayers.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">لا توجد نتائج مطابقة</div>
                    ) : (
                      filteredPlayers.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPlayer(p)}
                          className="w-full text-right p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex justify-between items-center group"
                        >
                          <div>
                            <p className="font-bold text-slate-700 group-hover:text-blue-600">{p.name || 'بدون اسم'}</p>
                            <p className="text-xs text-gray-400 font-mono" dir="ltr">{p.player_id}</p>
                          </div>
                          {p.owner && (
                            <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                              المالك: {p.owner.full_name.split(' ')[0]}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 2. Identity Verification Card (Safety Check) */}
              {selectedPlayer && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 mb-3 border-b border-blue-100 pb-2">
                    <CheckCircle size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-800">تم تحديد اللاعب</span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    {/* بيانات اللاعب */}
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600/70">اسم اللاعب:</span>
                      <span className="font-bold text-slate-700">{selectedPlayer.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600/70">رقم الهاتف (ID):</span>
                      <span className="font-mono font-bold text-slate-700 dir-ltr">{selectedPlayer.player_id}</span>
                    </div>

                    {/* بيانات المالك - أهم جزء للتحقق */}
                    {selectedPlayer.owner ? (
                      <div className="bg-white/60 rounded-lg p-3 mt-2 border border-blue-100/50">
                        <p className="text-xs text-blue-400 mb-2 font-bold flex items-center gap-1">
                          <User size={12} /> بيانات المالك الحقيقي:
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <UserCheck size={14} className="text-gray-400" />
                          <span className="text-slate-800 font-medium">{selectedPlayer.owner.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-slate-600 text-xs">{selectedPlayer.owner.email}</span>
                        </div>
                         <div className="flex items-center gap-2 mt-1">
                          <Smartphone size={14} className="text-gray-400" />
                          <span className="text-slate-600 text-xs dir-ltr">{selectedPlayer.owner.phone_number || '---'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                        ⚠️ هذا اللاعب غير مرتبط بمالك (Owner) مسجل!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. File Upload Area (Only visible if player selected) */}
              {selectedPlayer && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="relative">
                    <label 
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center gap-3 group
                        ${file ? 'border-green-500 bg-green-50/30' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'}
                      `}
                    >
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${file ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                        {file ? <CheckCircle size={28} /> : <UploadCloud size={28} />}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-bold text-gray-700 text-sm">
                          {file ? file.name : 'اضغط لاختيار ملف CSV'}
                        </p>
                        <p className="text-xs text-gray-400">تأكد أن الملف يخص {selectedPlayer.name}</p>
                      </div>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploading || !file}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                  >
                    {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={20} />}
                    {uploading ? 'جاري الرفع...' : 'تأكيد وحقن البيانات'}
                  </button>
                </div>
              )}

              {/* Status Messages */}
              {uploadStatus.message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
                  uploadStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {uploadStatus.type === 'success' ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                  <p className="font-medium leading-relaxed">{uploadStatus.message}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                <History className="text-purple-500" size={20} />
                سجل العمليات الحديثة
              </h3>
              <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">Live Updates</span>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">اسم الملف</th>
                    <th className="p-4">اللاعب المستهدف</th>
                    <th className="p-4 text-center">العدد</th>
                    <th className="p-4 text-center">الحالة</th>
                    <th className="p-4">التوقيت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        لا توجد عمليات رفع سابقة
                      </td>
                    </tr>
                  ) : (
                    batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-700 truncate max-w-[150px]" title={batch.file_name}>
                              {batch.file_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">
                          {batch.players?.name || '---'}
                          <span className="block text-xs text-gray-400 font-mono">{batch.players?.player_id}</span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-blue-600">
                          {batch.row_count > 0 ? batch.row_count.toLocaleString() : '-'}
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(batch.status)}
                        </td>
                        <td className="p-4 text-gray-400 text-xs">
                          {new Date(batch.created_at).toLocaleString('ar-EG')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}