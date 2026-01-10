import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, cleanup } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const n8nBaseUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK;

    if (!n8nBaseUrl) {
      console.error('❌ Missing Env Var: N8N_WEBHOOK_URL');
      throw new Error('N8N_WEBHOOK_URL is not defined');
    }

    const n8nUrl = `${n8nBaseUrl.replace(/\/$/, '')}/get-qr`;

    console.log('🚀 Sending request to n8n:', n8nUrl);

    const response = await axios.post(n8nUrl, {
      phone: phone,
      cleanup: cleanup
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000 
    });

    // 🔥 المنطقة الحاسمة: فحص ومعالجة البيانات
    let actualData = response.data;

    // طباعة شكل البيانات القادمة من n8n في التيرمينال
    console.log('📦 Raw Data from n8n:', JSON.stringify(actualData, null, 2));

    // إذا أرسل n8n مصفوفة، نأخذ العنصر الأول منها
    if (Array.isArray(actualData)) {
      console.log('⚠️ n8n returned an Array, extracting first item...');
      actualData = actualData[0];
    }

    // التحقق من أن لدينا كائن بيانات حقيقي
    if (!actualData) {
        throw new Error('Received empty data from n8n');
    }

    return NextResponse.json(actualData);

  } catch (error: any) {
    console.error('❌ N8N Proxy Error:', error.message);
    if (error.response) {
        console.error('Error Response Data:', error.response.data);
    }
    return NextResponse.json(
      { error: 'Failed to connect to automation engine' },
      { status: 500 }
    );
  }
}