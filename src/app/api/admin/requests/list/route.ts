import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  try {
    // التحقق من الصلاحية
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // جلب اللاعبين الذين ينتظرون الموافقة
    // نقوم بجلب أحدث طلب أولاً
    const { data, error } = await supabase
      .schema('job_game')
      .from('players')
      .select(`
        id,
        name,
        player_id,
        campaign_requested_at,
        current_phase,
        status,
        wallet_consumed,
        wallet_total,
        owner:users!owner_id (full_name, email)
      `)
      .eq('admin_approval_status', 'pending')
      .order('campaign_requested_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Fetch Requests Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}