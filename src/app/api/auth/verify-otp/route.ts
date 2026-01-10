import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { identifier, code } = await req.json();

    if (!identifier || !code) {
        return NextResponse.json({ message: 'بيانات ناقصة' }, { status: 400 });
    }

    const cleanIdentifier = identifier.toString().replace(/\D/g, '');

    // 1. التحقق من الكود واستهلاكه (RPC في public)
    const { data: isValid, error: rpcError } = await supabaseAdmin
        .rpc('check_and_consume_otp', {
            p_phone: cleanIdentifier,
            p_code: code
        });

    if (rpcError) {
         console.error('Verify RPC Error:', rpcError);
         return NextResponse.json({ error: 'خطأ فني في التحقق' }, { status: 500 });
    }

    // إذا كان الكود غير صحيح
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'الكود غير صحيح أو منتهي الصلاحية' }, 
        { status: 400 }
      );
    }

    // ============================================================
    // 2. تفعيل الحساب في قاعدة البيانات (Job Game Table)
    // ============================================================
    // نستخدم الدالة الجديدة التي أنشأناها في SQL
    const { data: userId, error: dbError } = await supabaseAdmin
        .rpc('activate_user_by_phone', {
            p_phone: cleanIdentifier
        });

    if (dbError || !userId) {
        console.error('Activation DB Error:', dbError);
        return NextResponse.json({ error: 'فشل تفعيل حساب المستخدم في قاعدة البيانات' }, { status: 500 });
    }

    // ============================================================
    // 3. تفعيل الحساب في Supabase Auth (تأكيد الإيميل الوهمي)
    // ============================================================
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email_confirm: true }
    );

    if (authError) {
         console.error('Auth Activation Error:', authError);
         // لا نوقف العملية هنا لأن المستخدم تفعل في الجدول الأساسي
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Critical Verify Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}