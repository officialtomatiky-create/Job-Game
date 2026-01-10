import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    // 1. التحقق من الأدمن
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const playerId = formData.get('playerId') as string;

    if (!file || !playerId) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    // 2. قراءة الملف كنص
    const fileContent = await file.text();

    // 3. الحفظ في قاعدة البيانات (مع المحتوى)
    const { data: batch, error: batchError } = await supabase
      .schema('job_game')
      .from('audience_batches')
      .insert({
        player_id: playerId,
        file_name: file.name,
        file_content: fileContent, // 🔥 تخزين مؤقت
        row_count: 0,
        status: 'queued' // حالة جديدة تعني "في الطابور"
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // 4. استدعاء n8n (نرسل فقط الـ ID)
    // ⚠️ استبدل الرابط برابط الويب هوك الذي ستنشئه في الخطوة القادمة
    const n8nWebhookUrl = 'https://n8n.dot.com.sa/webhook/engine-audience-injector';
    
    // نرسل الطلب ولا ننتظر الرد (Fire and Forget) لكي لا نعطل الواجهة
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_id: batch.id })
    }).catch(err => console.error('Failed to trigger n8n:', err));

    return NextResponse.json({ 
      success: true, 
      message: 'تم حفظ الملف، جاري المعالجة في الخلفية' 
    });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}