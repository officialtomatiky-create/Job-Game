import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema('job_game')
    .from('blacklist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { phone, reason } = body;

    if (!phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });

    // تنظيف الرقم (إزالة المسافات والرموز)
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const { error } = await supabase
      .schema('job_game')
      .from('blacklist')
      .insert({
        phone_number: cleanPhone,
        reason: reason,
        added_by: user.id
      });

    if (error) {
        if (error.code === '23505') { // كود تكرار المفتاح الفريد
            return NextResponse.json({ error: 'هذا الرقم موجود بالفعل في القائمة' }, { status: 400 });
        }
        throw error;
    }

    return NextResponse.json({ success: true, message: 'تمت إضافة الرقم للقائمة السوداء' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase
        .schema('job_game')
        .from('blacklist')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}