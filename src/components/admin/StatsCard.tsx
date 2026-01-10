import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string; // مثلاً "+5% هذا الأسبوع"
  trendColor?: 'green' | 'red' | 'gray';
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendColor = 'green',
  color = 'blue' 
}: StatsCardProps) {
  
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  const trendStyles = {
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    gray: 'text-gray-500 bg-gray-50',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorStyles[color]}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendStyles[trendColor]}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );
}