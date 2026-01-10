import { Activity, Database, Server } from 'lucide-react';

interface HealthStatus {
  database: 'online' | 'offline';
  n8nWebhook: 'online' | 'offline';
  latency: number;
}

export default function HealthMonitor({ status }: { status: HealthStatus | null }) {
  if (!status) return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse h-24"></div>
  );

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden">
      {/* Background Decoration */}
      <Activity className="absolute -left-4 -bottom-4 text-slate-800/50 w-32 h-32" />

      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
        <Activity size={20} className="text-green-400" />
        حالة النظام (System Health)
      </h3>
      
      <div className="grid grid-cols-2 gap-4 relative z-10">
        
        {/* Database Status */}
        <div className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-blue-400" />
            <span className="text-sm text-slate-300">قاعدة البيانات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${status.database === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
            <span className="text-xs font-mono">{status.database === 'online' ? 'Connected' : 'Error'}</span>
          </div>
        </div>

        {/* N8N Status */}
        <div className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-purple-400" />
            <span className="text-sm text-slate-300">N8N Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${status.n8nWebhook === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
            <span className="text-xs font-mono">{status.n8nWebhook === 'online' ? 'Active' : 'Down'}</span>
          </div>
        </div>

      </div>
      
      <div className="mt-3 text-right">
        <span className="text-xs text-slate-500 font-mono">Latency: {status.latency}ms</span>
      </div>
    </div>
  );
}