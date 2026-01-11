'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, ChevronDown, LayoutDashboard, CreditCard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 1. جلب بيانات المستخدم عند التحميل
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // جلب البيانات الإضافية (الاسم والصورة) من جدول job_game
        const { data: profileData } = await supabase
          .schema('job_game')
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
    };

    getUser();

    // الاستماع للتغييرات (عند تسجيل الدخول أو الخروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // دالة تسجيل الخروج (نفس الكود القديم الخاص بك لضمان الاستقرار)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      document.cookie.split(";").forEach((c) => { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navItems = [
    { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
    { name: 'الفوترة', href: '/billing', icon: CreditCard },
  ];

  if (pathname === '/auth') return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* الشعار والروابط الرئيسية */}
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                Game<span className="text-[#00a884]">_Job</span>
              </Link>
            </div>
            
            {/* إخفاء الروابط إذا لم يكن مسجلاً */}
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* الجزء الأيسر: زر الدخول أو قائمة المستخدم */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!user ? (
              pathname === '/' && (
                <Link
                  href="/auth"
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  دخول
                </Link>
              )
            ) : (
              // ركن المستخدم (User Corner)
              <div className="relative ml-3" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 bg-white hover:bg-gray-50 p-2 rounded-xl border border-gray-100 transition-all focus:outline-none"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-700 line-clamp-1">
                      {profile?.full_name || 'مستخدم'}
                    </p>
                    <p className="text-xs text-gray-400">نشط</p>
                  </div>
                  
                  {/* الصورة الشخصية أو أيقونة افتراضية */}
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {/* القائمة المنسدلة */}
                {isUserMenuOpen && (
                  <div className="origin-top-left absolute left-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in duration-200">
                     <div className="px-4 py-2 border-b border-gray-100 md:hidden text-center">
                        <p className="text-sm font-bold text-gray-700">{profile?.full_name}</p>
                     </div>
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <item.icon size={16} />
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-50"
                    >
                      <LogOut size={16} />
                      تسجيل خروج
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* زر القائمة للموبايل */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">فتح القائمة</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الموبايل */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <div className="px-4 py-3 flex items-center gap-3 bg-gray-50 mb-2">
                   <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-gray-900">{profile?.full_name || 'مستخدم'}</p>
                      <p className="text-xs text-gray-500">{user.email || user.phone}</p>
                   </div>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block pl-3 pr-4 py-2 border-r-4 text-base font-medium ${
                      pathname === item.href
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                        <item.icon size={18} />
                        {item.name}
                    </div>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 pl-3 pr-4 py-3 border-r-4 border-transparent text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  <LogOut size={18} />
                  تسجيل خروج
                </button>
              </>
            ) : (
                <div className="p-4">
                     <Link
                    href="/auth"
                    className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    دخول
                  </Link>
                </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}