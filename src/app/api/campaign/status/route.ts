import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logSystemError } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const { playerId, status } = await req.json();

    // التحقق من المدخلات
    if (!playerId || !['active', 'paused'].includes(status)) {
      return NextResponse.json({ error: 'Invalid Player ID or Status' }, { status: 400 });
    }

    // 1. تحديث الحالة في قاعدة البيانات
    const { error } = await supabaseAdmin
      .schema('job_game')
      .from('players')
      .update({ 
        status: status,
        updated_at: new Date().toISOString() // تحديث توقيت التعديل
      })
      .eq('id', playerId);

    if (error) {
      throw error;
    }

    // 2. تسجيل الحدث في اللوج
    await supabaseAdmin.schema('job_game').from('system_logs').insert({
      level: 'INFO',
      source: 'API/campaign/status',
      message: `Campaign status updated to: ${status}`,
      details: { playerId, newStatus: status }
    });

    return NextResponse.json({ success: true, message: `Campaign ${status} successfully` });

  } catch (error: any) {
    // تسجيل الخطأ
    await logSystemError({
      source: 'API/campaign/status',
      message: 'Failed to update campaign status',
      error: error
    });

    return NextResponse.json(
      { success: false, error: 'Failed to update campaign status' }, 
      { status: 500 }
    );
  }
}