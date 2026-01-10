import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. انتظار إنشاء العميل (لأن الكوكيز async في Next.js 16)
    const supabase = await createClient();
    
    // استلام البيانات
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    // تنفيذ التحديث
    const { error } = await supabase
      .schema('job_game') // تحديد السكيما
      .from('players')
      .update({ name: name })
      .eq('id', id);

    if (error) {
      console.error('Supabase Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}