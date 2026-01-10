import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { playerId, action, reason } = body;

    if (!playerId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    let updateData: any = {};

    if (action === 'approve') {
      updateData = {
        admin_approval_status: 'approved',
        status: 'active', // 🚀 انطلاق المحرك
        // إعادة ضبط عدادات المرحلة لتبدأ رحلة جديدة نظيفة
        days_in_phase: 0,
        phase_iteration: 1,
        // يمكننا أيضاً تحديث وقت البدء الفعلي إذا أردت
        updated_at: new Date().toISOString()
      };
    } else {
      // جلب الكونفيق الحالي لإضافة سبب الرفض دون مسح الإعدادات الأخرى
      const { data: player } = await supabase
        .schema('job_game')
        .from('players')
        .select('config')
        .eq('id', playerId)
        .single();

      const currentConfig = player?.config || {};
      
      updateData = {
        admin_approval_status: 'rejected',
        status: 'paused', // تجميد
        config: {
          ...currentConfig,
          last_rejection_reason: reason,
          last_rejection_date: new Date().toISOString()
        }
      };
    }

    const { error } = await supabase
      .schema('job_game')
      .from('players')
      .update(updateData)
      .eq('id', playerId);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: action === 'approve' ? 'تم تفعيل اللاعب، سيبدأ المحرك بالعمل قريباً' : 'تم رفض الطلب وإبلاغ المستخدم'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}