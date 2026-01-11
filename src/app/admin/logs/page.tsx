'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Database } from 'lucide-react';

interface SystemLog {
  id: string;
  created_at: string;
  level: string;
  source: string;
  message: string;
  details: any;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // الطلب الآن يذهب للـ API الخاص بنا
      const response = await fetch('/api/admin/logs', {
        cache: 'no-store' // لضمان عدم تخزين النسخة القديمة
      });
      
      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Database className="text-blue-600" />
              سجل أخطاء النظام
            </h1>
            <p className="text-gray-500 text-sm mt-1 mr-9">
              يتم عرض آخر 50 خطأ مسجل في قاعدة البيانات (job_game)
            </p>
          </div>
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث القائمة
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center flex justify-center text-gray-400">
               <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-4 w-48">الوقت</th>
                    <th className="p-4 w-48">المصدر</th>
                    <th className="p-4">الرسالة</th>
                    <th className="p-4 w-24">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-red-50/40 transition-colors group">
                        <td className="p-4 text-gray-500 text-sm whitespace-nowrap" dir="ltr">
                          {new Date(log.created_at).toLocaleString('en-US', { hour12: false })}
                        </td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono border border-gray-200">
                            {log.source}
                          </span>
                        </td>
                        <td className="p-4 text-gray-800 font-medium text-sm">
                          {log.message}
                        </td>
                        <td className="p-4">
                          {log.details ? (
                            <details className="relative group/details">
                              <summary className="list-none cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800 select-none bg-blue-50 px-3 py-1 rounded-full w-fit">
                                عرض JSON
                              </summary>
                              <div className="absolute left-0 mt-2 w-96 max-h-60 overflow-auto bg-slate-900 text-green-400 p-3 rounded-lg shadow-xl z-10 text-xs font-mono hidden group-open/details:block" dir="ltr">
                                <pre>{JSON.stringify(log.details, null, 2)}</pre>
                              </div>
                            </details>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <AlertTriangle className="w-12 h-12 mb-2 opacity-20" />
                            <p>سجل الأخطاء نظيف تماماً!</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}