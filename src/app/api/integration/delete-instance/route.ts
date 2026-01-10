import { NextResponse } from 'next/server';
import axios from 'axios';
import { supabaseAdmin } from '@/lib/supabase';
import { logSystemError } from '@/lib/logger';

export async function POST(req: Request) {
  let targetPlayerId = '';
  let targetInstanceName = '';

  try {
    const body = await req.json();
    const { playerId, instanceName } = body;

    targetPlayerId = playerId;
    targetInstanceName = instanceName;

    if (!playerId || !instanceName) {
      return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
    }

    const evoUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_TOKEN;

    if (!evoUrl || !apiKey) {
      return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
    }

    const headers = { 'apikey': apiKey };

    // ==========================================
    // الخطوة 1: محاولة عمل Logout أولاً (لضمان قطع الاتصال)
    // ==========================================
    try {
      // نحاول فصله أولاً، ونتجاهل الخطأ إذا كان مفصولاً أصلاً
      await axios.delete(`${evoUrl}/instance/logout/${instanceName}`, { headers });
    } catch (e) {
      // نتجاهل خطأ الـ Logout ونكمل للحذف
      console.log('Logout failed or already logged out, proceeding to delete...');
    }

    // انتظار قصير جداً لضمان معالجة السيرفر لطلب الفصل
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ==========================================
    // الخطوة 2: حذف الانستانس نهائياً
    // ==========================================
    try {
      await axios.delete(`${evoUrl}/instance/delete/${instanceName}`, { headers });
      
      // توثيق نجاح حذف الانستانس
      await supabaseAdmin.schema('job_game').from('system_logs').insert({
        level: 'INFO',
        source: 'API/deletePlayer',
        message: `Instance deleted from Evo: ${instanceName}`,
      });

    } catch (evoError: any) {
      // إذا كان الخطأ 404 (غير موجود) أو 400، نعتبره محذوفاً ونكمل
      if (evoError.response?.status === 404 || evoError.response?.status === 400) {
        console.warn(`Instance ${instanceName} already deleted.`);
      } else {
        // إذا كان خطأ آخر، نسجله ولكن "لا" نوقف العملية لتنظيف قاعدة البيانات
        // ولكن سنضيف تحذيراً في الاستجابة
        console.error('Failed to delete instance from Evo', evoError.message);
        await logSystemError({ 
          source: 'API/deletePlayer', 
          message: `Failed to delete instance from Evo: ${instanceName}`, 
          error: evoError 
        });
      }
    }

    // ==========================================
    // الخطوة 3: حذف اللاعب من قاعدة البيانات
    // ==========================================
    const { error: dbError } = await supabaseAdmin
      .schema('job_game')
      .from('players')
      .delete()
      .eq('id', playerId);

    if (dbError) {
      throw new Error(`Database Delete Failed: ${dbError.message}`);
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' });

  } catch (error: any) {
    await logSystemError({
      source: 'API/deletePlayer',
      message: 'Critical error deleting player',
      error: error
    });

    return NextResponse.json(
      { success: false, error: 'Failed to complete deletion' }, 
      { status: 500 }
    );
  }
}