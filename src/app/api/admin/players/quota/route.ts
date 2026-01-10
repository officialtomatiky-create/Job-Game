import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    // تحقق الأدمن
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { playerId, walletTotal } = body;

    if (!playerId || walletTotal === undefined) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // تحديث الرصيد
    const { error } = await supabase
      .schema('job_game')
      .from('players')
      .update({ wallet_total: walletTotal })
      .eq('id', playerId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم تحديث الرصيد بنجاح' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}