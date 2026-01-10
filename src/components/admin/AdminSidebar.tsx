'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Activity, 
  UploadCloud, 
  Users, 
  FileText, 
  ShieldBan, 
  Megaphone, 
  LogOut,
  X,
  ShieldAlert
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const menuItems = [
    { name: 'نظرة عامة', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'طلبات الحملات', href: '/admin/requests', icon: Activity },
    { name: 'حقن الجمهور', href: '/admin/audience', icon: UploadCloud },
    { name: 'اللاعبين والمستخدمين', href: '/admin/players', icon: Users },
    { name: 'البلاك ليست', href: '/admin/blacklist', icon: ShieldBan }, // جديد
    { name: 'إشعارات عامة', href: '/admin/broadcast', icon: Megaphone }, // جديد
    { name: 'سجلات النظام', href: '/admin/logs', icon: FileText },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <aside 
      className={`fixed inset-y-0 right-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out transform 
      ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto flex flex-col h-screen border-l border-slate-800`}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
        <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
          <ShieldAlert size={24} />
          Admin Panel
        </h1>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { if(window.innerWidth < 1024) onClose() }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="mb-4 px-2">
          <p className="text-xs text-slate-500 font-medium">تم تسجيل الدخول كـ</p>
          <p className="text-sm font-bold text-slate-300">Super Admin</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl transition-all border border-transparent hover:border-red-900/50"
        >
          <LogOut size={20} />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
}