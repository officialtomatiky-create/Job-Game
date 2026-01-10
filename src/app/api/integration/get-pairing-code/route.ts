import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, cleanup } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // هنا سنرسل الطلب إلى N8N Webhook الجديد المخصص للـ Pairing Code
    // ملاحظة: استبدل الرابط أدناه برابط الويب هوك الجديد الخاص بك من n8n
    const N8N_WEBHOOK_URL = `${process.env.N8N_WEBHOOK}/get-pairing-code`; 

    const response = await axios.post(N8N_WEBHOOK_URL, {
      phone: phone,
      cleanup: cleanup || false,
      method: 'pairing_code' // إشارة للمحرك أننا نريد Pairing Code
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