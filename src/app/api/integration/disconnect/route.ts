import { NextResponse } from 'next/server';
import axios from 'axios';
import { logSystemError } from '@/lib/logger'; // ✅ استيراد اللوجر

export async function POST(req: Request) {
  // متغير لحفظ اسم الانستانس لاستخدامه في تسجيل الخطأ إذا حدث
  let instanceNameForLog = 'unknown';

  try {
    const { instanceName } = await req.json();
    instanceNameForLog = instanceName || 'unknown';

    if (!instanceName) {
      return NextResponse.json({ error: 'Instance Name is required' }, { status: 400 });
    }

    // ✅ استخدام متغيرات البيئة
    const evoUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_TOKEN;

    if (!evoUrl || !apiKey) {
      const msg = 'Missing Evolution API Env Vars';
      // ✅ تسجيل خطأ تكوين السيرفر
      await logSystemError({ 
        source: 'API/disconnect', 
        message: msg, 
        error: { evoUrl: !!evoUrl, apiKey: !!apiKey } 
      });
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    // إرسال طلب Logout
    await axios.delete(`${evoUrl}/instance/logout/${instanceName}`, {
      headers: {
        'apikey': apiKey
      }
    });

    return NextResponse.json({ success: true, message: 'Disconnected successfully' });

  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error.message;

    console.error('Disconnect Error:', errorMsg);

    // ✅ تسجيل الخطأ في النظام (Log System Error)
    await logSystemError({
      source: 'API/disconnect',
      message: `Failed to disconnect instance: ${instanceNameForLog}`,
      error: error
    });
    
    // إرجاع خطأ صريح للواجهة
    return NextResponse.json(
      { success: false, error: errorMsg || 'Failed to disconnect instance' }, 
      { status: 500 }
    );
  }
}