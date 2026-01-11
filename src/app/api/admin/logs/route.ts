import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // نستخدم Service Role Key هنا لأنه مسار Admin ولتجاوز أي مشاكل في RLS
    // إذا لم يكن متوفراً، استخدم NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .schema('job_game') // تحديد السكيما ضروري جداً
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}