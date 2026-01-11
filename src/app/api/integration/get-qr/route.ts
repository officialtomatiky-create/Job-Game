import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, cleanup } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // الاعتماد المباشر على متغير البيئة
    const n8nBaseUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK;

    if (!n8nBaseUrl) {
      console.error('❌ Missing Env Var: N8N_WEBHOOK');
      throw new Error('N8N_WEBHOOK is not defined');
    }

    // ✅ التعديل: توحيد المسار الجديد (instance-connect)
    const n8nUrl = `${n8nBaseUrl.replace(/\/$/, '')}/instance-connect`;

    console.log('🚀 Sending request to n8n (QR):', n8nUrl);

    const response = await axios.post(n8nUrl, {
      phone: phone,
      cleanup: cleanup,
      type: 'qr' // إشارة اختيارية للمحرك (للمستقبل)
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000 // زيادة الوقت قليلاً لضمان الإنشاء
    });

    let actualData = response.data;

    // معالجة البيانات القادمة من n8n
    if (Array.isArray(actualData)) {
      actualData = actualData[0];
    }

    if (!actualData) {
        throw new Error('Received empty data from n8n');
    }

    return NextResponse.json(actualData);

  } catch (error: any) {
    console.error('❌ N8N Proxy Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to connect to automation engine' },
      { status: 500 }
    );
  }
}