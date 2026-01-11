import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. استخدام Service Role Key لتجاوز RLS والحصول على صلاحيات الأدمن
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // تأكد من وجود هذا المتغير في .env.local
    );

    // 2. جلب البيانات من جدول players في سكيما job_game
    const { data: players, error } = await supabase
      .schema('job_game')
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin List Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. إرجاع البيانات
    return NextResponse.json(players);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}