import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import axios from 'axios';

// إعداد عميل Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const healthStatus = {
    database: 'down',
    evolution_api: 'down',
    n8n_workflow: 'down',
    timestamp: new Date().toISOString()
  };

  try {
    // 1. فحص قاعدة البيانات (Supabase)
    const { data, error } = await supabase
        .schema('job_game')
        .from('players')
        .select('count')
        .limit(1)
        .single();
    
    if (!error) healthStatus.database = 'operational';
  } catch (e) {
    console.error('DB Health Check Failed');
  }

  try {
    // 2. فحص Evolution API (نتأكد من استجابة السيرفر)
    // نرسل طلب بسيط لجلب النسخة أو الحالة
    if (process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_TOKEN) {
      const evoRes = await axios.get(`${process.env.EVOLUTION_API_URL}/instance/fetchInstances`, {
        headers: { apikey: process.env.EVOLUTION_API_TOKEN },
        timeout: 3000 // مهلة قصيرة 3 ثواني
      });
      if (evoRes.status === 200) healthStatus.evolution_api = 'operational';
    } else {
        healthStatus.evolution_api = 'not_configured';
    }
  } catch (e) {
    console.error('Evo API Check Failed');
  }

  try {
    // 3. فحص N8N (نتأكد أن الويب هوك يستجيب)
    // نرسل طلب POST فارغ أو مخصص للفحص
    if (process.env.N8N_WEBHOOK) {
        // ملاحظة: قد يعيد n8n خطأ 400 إذا كان الجسم فارغاً، لكن هذا يعني أن السيرفر يعمل
        // سنعتبر أي استجابة (حتى الخطأ من n8n) دليلاً على أنه "حي"
        await axios.post(process.env.N8N_WEBHOOK, { check: true }, { timeout: 3000 })
            .then(() => { healthStatus.n8n_workflow = 'operational'; })
            .catch((err) => {
                if (err.response) healthStatus.n8n_workflow = 'operational'; // الخادم رد (حتى لو بخطأ منطقي)
                else healthStatus.n8n_workflow = 'down'; // الخادم لم يرد إطلاقاً
            });
    } else {
        healthStatus.n8n_workflow = 'not_configured';
    }
  } catch (e) {
    // تم التعامل معه في الـ catch الداخلي
  }

  return NextResponse.json(healthStatus);
}