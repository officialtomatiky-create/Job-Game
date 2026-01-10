import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // تتبع في الترمينال
  console.log(`🔒 Middleware Checking: ${request.nextUrl.pathname}`);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // --- 1. الكود القديم الخاص بك (حماية المسارات العادية) ---
  const protectedPaths = ['/dashboard', '/billing']
  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !user) {
    console.log('⛔ Access Denied: Redirecting to auth');
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (user && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // --- 2. 🔥 الإضافة الجديدة: حماية مسارات الأدمن (job_game.users) 🔥 ---
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // أ: إذا لم يكن مسجلاً للدخول أصلاً، نرسله لصفحة الدخول
    if (!user) {
      console.log('⛔ Admin Access Denied: No User');
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // ب: التحقق من الصلاحية من قاعدة البيانات
    const { data: userData, error } = await supabase
      .schema('job_game') // ✅ تحديد السكيما ضروري جداً
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // ج: إذا حدث خطأ، أو لم يكن المستخدم موجوداً في الجدول، أو لم يكن Role هو admin
    if (error || !userData || userData.role !== 'admin') {
      console.warn(`⛔ Unauthorized Admin Access attempt by: ${user.email} (Role: ${userData?.role || 'none'})`);
      // نطرده إلى الداشبورد العادية
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    console.log(`✅ Admin Access Granted for: ${user.email}`);
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}