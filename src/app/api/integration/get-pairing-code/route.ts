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
        throw new Error('N8N_WEBHOOK is not defined');
    }

    // ✅ التعديل: استخدام نفس المسار الموحد (instance-connect)
    const N8N_WEBHOOK_URL = `${n8nBaseUrl.replace(/\/$/, '')}/instance-connect`; 

    console.log('🚀 Sending request to n8n (Pairing):', N8N_WEBHOOK_URL);

    const response = await axios.post(N8N_WEBHOOK_URL, {
      phone: phone,
      cleanup: cleanup || false,
      method: 'pairing_code' // إشارة مهمة للمحرك
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error in pairing code route:', error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}