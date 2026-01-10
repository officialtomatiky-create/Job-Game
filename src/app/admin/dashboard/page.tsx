'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Clock, 
  PlayCircle, 
  FileSpreadsheet, 
  RefreshCw, 
  ShieldCheck 
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import HealthMonitor from '@/components/admin/HealthMonitor';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (error) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={32} />
            لوحة القيادة
          </h1>
          <p className="text-gray-500 mt-1">نظرة شاملة على أداء منصة Job Game</p>
        </div>
        
        <button 
          onClick={fetchStats} 
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-all font-medium text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          تحديث البيانات
        </button>
      </div>

      {/* Health Monitor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نضع مراقب الصحة في بطاقة كبيرة */}
        <div className="lg:col-span-1">
           <HealthMonitor status={data?.health || null} />
        </div>

        {/* Welcome or Quick Actions (Placeholder) */}
        <div className="lg:col-span-2 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <h2 className="text-2xl font-bold mb-2 relative z-10">مرحباً بك أيها المشرف! 👋</h2>
          <p className="text-blue-100 relative z-10 max-w-lg">
            لديك صلاحيات كاملة للتحكم في الحملات، مراقبة الجمهور، وإدارة اللاعبين. تأكد من مراجعة "الطلبات المعلقة" بشكل دوري.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Pending Requests */}
        <StatsCard 
          title="طلبات قيد الانتظار"
          value={loading ? '...' : data?.pendingRequests || 0}
          icon={Clock}
          color="orange"
          trend={data?.pendingRequests > 0 ? 'يتطلب إجراء' : 'لا يوجد'}
          trendColor={data?.pendingRequests > 0 ? 'red' : 'gray'}
        />

        {/* 2. Active Campaigns */}
        <StatsCard 
          title="حملات نشطة"
          value={loading ? '...' : data?.activeCampaigns || 0}
          icon={PlayCircle}
          color="green"
          trend="تعمل الآن"
          trendColor="green"
        />

        {/* 3. Total Players */}
        <StatsCard 
          title="إجمالي اللاعبين"
          value={loading ? '...' : data?.totalPlayers || 0}
          icon={Users}
          color="blue"
        />

        {/* 4. Audience Files */}
        <StatsCard 
          title="ملفات الجمهور"
          value={loading ? '...' : data?.totalAudienceFiles || 0}
          icon={FileSpreadsheet}
          color="purple"
        />

      </div>
    </div>
  );
}