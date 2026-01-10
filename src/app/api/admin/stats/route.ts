import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const startTime = Date.now();

  try {
    // 1. التحقق من الأمان (Admin Check)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. تنفيذ الاستعلامات بشكل متوازي للأداء العالي
    const [
      playersCount, 
      pendingRequests, 
      activeCampaigns,
      audienceBatches
    ] = await Promise.all([
      // أ. إجمالي اللاعبين
      supabase.schema('job_game').from('players').select('*', { count: 'exact', head: true }),
      
      // ب. الطلبات المعلقة (التي تنتظر موافقة الأدمن)
      supabase.schema('job_game').from('players')
        .select('*', { count: 'exact', head: true })
        .eq('admin_approval_status', 'pending'),

      // ج. الحملات النشطة حالياً
      supabase.schema('job_game').from('players')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
        
      // د. ملفات الجمهور التي تم رفعها
      supabase.schema('job_game').from('audience_batches')
        .select('*', { count: 'exact', head: true })
    ]);

    // 3. حساب زمن الاستجابة (Latency) للتحقق من صحة قاعدة البيانات
    const dbLatency = Date.now() - startTime;

    // 4. تجميع البيانات
    const stats = {
      totalPlayers: playersCount.count || 0,
      pendingRequests: pendingRequests.count || 0,
      activeCampaigns: activeCampaigns.count || 0,
      totalAudienceFiles: audienceBatches.count || 0,
      health: {
        database: playersCount.error ? 'offline' : 'online',
        n8nWebhook: 'online', // سنفترض أنه يعمل حالياً، يمكنك ربطه بـ Ping فعلي لاحقاً
        latency: dbLatency
      }
    };

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}