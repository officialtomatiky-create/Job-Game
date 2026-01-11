import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
    }

    // استخدام مفتاح الخدمة للوصول لوظائف إدارة المستخدمين (auth.admin)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. أولاً نحتاج لجلب البريد الإلكتروني للمستخدم من جدول players
    // (بافتراض أن الجدول يحتوي على email أو auth_user_id)
    const { data: player, error: playerError } = await supabaseAdmin
      .schema('job_game')
      .from('players')
      .select('email') // أو auth_user_id إذا كان الربط عن طريقه
      .eq('id', playerId) // أو eq('player_id', playerId) حسب تسمية العمود
      .single();

    if (playerError || !player?.email) {
      return NextResponse.json({ error: 'Player email not found' }, { status: 404 });
    }

    // 2. توليد رابط تسجيل دخول سحري لهذا الإيميل
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: player.email,
    });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    // 3. إرجاع الرابط للأدمن ليتم توجيهه إليه
    return NextResponse.json({ 
      success: true, 
      redirectUrl: linkData.properties.action_link 
    });

  } catch (error) {
    console.error('Impersonate Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}