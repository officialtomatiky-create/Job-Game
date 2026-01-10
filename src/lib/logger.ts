import { supabaseAdmin } from '@/lib/supabase';

interface LogErrorParams {
  source: string;
  message: string;
  error?: any;
}

export async function logSystemError({ source, message, error }: LogErrorParams) {
  try {
    // تجهيز تفاصيل الخطأ لتكون قابلة للتخزين كـ JSON
    const errorDetails = error ? {
      message: error.message,
      stack: error.stack,
      raw: JSON.stringify(error, Object.getOwnPropertyNames(error)) // حيلة لضمان تخزين كل خصائص الخطأ
    } : null;

    // طباعة في الكونسول للمطور أثناء العمل
    console.error(`[SYSTEM LOG - ${source}]:`, message);

    // الحفظ في قاعدة البيانات (داخل job_game)
    // نستخدم supabaseAdmin لنتجاوز أي قيود RLS أثناء الكتابة
    await supabaseAdmin
      .schema('job_game') // 👈 تحديد السكيما هنا ضروري
      .from('system_logs')
      .insert({
        level: 'ERROR',
        source: source,
        message: message,
        details: errorDetails
      });

  } catch (loggingError) {
    // في أسوأ الظروف، نطبع خطأ التسجيل في الكونسول
    console.error('CRITICAL: FAILED TO LOG TO DB', loggingError);
  }
}