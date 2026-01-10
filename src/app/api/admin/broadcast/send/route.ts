import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, message, type, expiresAfterHours } = body; // expiresAfterHours: عدد الساعات

    // حساب وقت الانتهاء
    let expiresAt = null;
    if (expiresAfterHours) {
        const date = new Date();
        date.setHours(date.getHours() + parseInt(expiresAfterHours));
        expiresAt = date.toISOString();
    }

    const { error } = await supabase
      .schema('job_game')
      .from('system_notifications')
      .insert({
        title,
        message,
        type: type || 'info',
        created_by: user.id,
        expires_at: expiresAt
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
    const supabase = await createClient();
    const { data } = await supabase.schema('job_game').from('system_notifications').select('*').order('created_at', { ascending: false });
    return NextResponse.json(data);
}