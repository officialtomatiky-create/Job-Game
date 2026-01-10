import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();

  // 1. إنشاء العميل
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );

  try {
    // 2. التحقق من المستخدم
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. استدعاء الدالة (RPC)
    // التصحيح: تم إزالة المعاملات لأن الدالة تعتمد على auth.uid()
    const { data: players, error } = await supabase
      .rpc('get_my_players');

    if (error) {
      console.error('RPC Error:', error);
      throw new Error(error.message);
    }

    // الدالة ترجع البيانات جاهزة ولا تحتاج لدمج أو معالجة إضافية
    return NextResponse.json(players || []);

  } catch (error: any) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ error: 'فشل جلب البيانات' }, { status: 500 });
  }
}