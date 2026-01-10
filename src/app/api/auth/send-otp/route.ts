import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { phone, user_id, full_name } = await req.json();
    
    if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 });

    // تنظيف الرقم
    const cleanPhone = phone.toString().replace(/\D/g, '');

    // 1. حفظ المستخدم (باستخدام الدالة الموجودة في public)
    if (user_id) {
        const { error: rpcError } = await supabaseAdmin
            .rpc('create_job_game_user', {
                p_id: user_id,
                p_phone: cleanPhone,
                p_full_name: full_name || 'User',
                p_email: `${cleanPhone}@phone.local`
            });
            
        if (rpcError) console.error('DB Save Error:', rpcError);
    }

    // 2. توليد الكود
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // حفظ الكود
    const { error: otpError } = await supabaseAdmin
      .rpc('save_verification_code', { p_phone: cleanPhone, p_code: otp });

    if (otpError) throw new Error(otpError.message);

    // 3. إرسال الواتساب (Payload بسيط جداً لتجنب الأخطاء)
    const evoUrl = process.env.EVOLUTION_API_URL?.replace(/\/+$/, "");
    const evoToken = process.env.EVOLUTION_API_TOKEN;
    
    if (evoUrl && evoToken) {
        try {
            await axios.post(
                `${evoUrl}/message/sendText/Job_Game_Verify_2FA`,
                {
                    number: cleanPhone,
                    text: `كود التحقق: ${otp}` // نص فقط بدون تنسيقات معقدة
                },
                { headers: { apikey: evoToken } }
            );
        } catch (e: any) {
            console.error('WhatsApp Error:', e.response?.data || e.message);
        }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Fatal:', error);
    return NextResponse.json({ error: 'System Error' }, { status: 500 });
  }
}