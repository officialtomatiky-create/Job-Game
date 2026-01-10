import { NextResponse } from 'next/server';
import axios from 'axios';
import { logSystemError } from '@/lib/logger'; // 👈 1. استيراد أداة التسجيل

/**
 * هذا الملف هو الجسر الذي يرسل بيانات اللاعب لمحرك n8n (Dashboard Engine 04)
 * يتم استدعاؤه بعد التأكد من أن المستخدم ربط الواتساب بنجاح.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // جلب الرابط الأساسي (Base URL) من متغيرات البيئة
    // القيمة المتوقعة: https://n8n.your-domain.com/webhook/
    const N8N_BASE_WEBHOOK = process.env.N8N_WEBHOOK;

    if (!N8N_BASE_WEBHOOK) {
      throw new Error('الرابط الأساسي لـ n8n Webhook غير معرف في ملفات البيئة');
    }

    // بناء الرابط الكامل للمحرك المطلوب (Dashboard Engine 04)
    // نقوم بالتأكد من دمج المسار بشكل صحيح سواء انتهى الرابط بـ / أو لا
    const cleanBaseUrl = N8N_BASE_WEBHOOK.endsWith('/') ? N8N_BASE_WEBHOOK : `${N8N_BASE_WEBHOOK}/`;
    const fullWebhookUrl = `${cleanBaseUrl}add-player`;

    // إرسال البيانات لمحرك n8n
    // ملاحظة: نرسل البيانات داخل كائن body ليتوافق مع عقدة Webhook في n8n (From Budibase)
    const n8nResponse = await axios.post(fullWebhookUrl, {
      body: {
        player_id: body.player_id,
        source_type: body.source_type || "sheet_url",
        sheet_url: body.sheet_url,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'تم إرسال البيانات للمحرك بنجاح وبدء عملية الإعداد' 
    });

  } catch (error: any) {
    // 👈 2. تسجيل الخطأ في قاعدة البيانات بدلاً من الكونسول فقط
    // هذا يساعدك لتعرف إذا كان n8n متوقفاً أو يرفض الاتصال
    await logSystemError({
        source: 'n8n-bridge-add-player',
        message: 'Failed to trigger n8n Engine 04',
        error: error
    });

    return NextResponse.json({ 
      success: false, 
      error: 'فشل في تشغيل محرك n8n، تأكد من إعدادات الرابط والسيرفر' 
    }, { status: 500 });
  }
}