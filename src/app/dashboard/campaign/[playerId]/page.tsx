'use client';

// 1. استيراد 'use' من react
import { useState, use } from 'react'; 
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; 
import { Upload, CheckCircle, ArrowRight, Loader2, Briefcase, Building2, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';
import { SAUDI_CITIES } from '@/lib/constants'; 

interface PageProps {
  // 2. تعديل النوع ليصبح Promise
  params: Promise<{
    playerId: string;
  }>;
}

export default function CampaignPage({ params }: PageProps) {
  // 3. استخدام use() لفك الـ params
  const { playerId } = use(params); 
  
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [companies, setCompanies] = useState('');
  const [city, setCity] = useState(SAUDI_CITIES[0]);
  const [notes, setNotes] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('الرجاء رفع ملف بصيغة PDF فقط');
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !cvFile) {
      alert('يرجى تعبئة الحقول المطلوبة ورفع السيرة الذاتية');
      return;
    }

    setLoading(true);

    try {
      // 1. رفع ملف الـ CV
      const fileName = `${playerId}/${Date.now()}-cv.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, cvFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // 2. الحصول على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // 3. حفظ البيانات في الجدول
      const { error: insertError } = await supabase
        .from('campaign_requests')
        .insert({
          player_id: playerId,
          user_id: user.id,
          job_title: jobTitle,
          target_companies: companies,
          target_city: city,
          cv_file_url: publicUrl,
          notes: notes,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setSuccess(true);
      
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full animate-in zoom-in">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">تم استلام طلبك بنجاح!</h2>
          <p className="text-gray-500 mb-8">سيقوم فريقنا بمراجعة البيانات والبدء في جمع الجمهور المستهدف لحملتك.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-600">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعداد حملة التوظيف</h1>
            <p className="text-gray-500 text-sm">الحساب المستهدف: <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{playerId}</span></p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          
          {/* Job Title */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-500"/>
              المسمى الوظيفي المستهدف
            </label>
            <input 
              type="text" 
              required
              placeholder="مثال: مسوق عقاري، مهندس مدني..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          {/* Target Companies */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Building2 size={18} className="text-purple-500"/>
              القطاعات أو الشركات المستهدفة
            </label>
            <input 
              type="text" 
              placeholder="مثال: شركات المقاولات، معارض السيارات، عيادات الأسنان..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={companies}
              onChange={(e) => setCompanies(e.target.value)}
            />
            <p className="text-xs text-gray-400">افصل بين الكلمات بفاصلة أو مسافة</p>
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <MapPin size={18} className="text-red-500"/>
              النطاق الجغرافي
            </label>
            <div className="relative">
              <select 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {SAUDI_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          {/* CV Upload */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FileText size={18} className="text-orange-500"/>
              السيرة الذاتية (CV)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer relative group">
              <input 
                type="file" 
                accept=".pdf"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <Upload size={24} />
                </div>
                {cvFile ? (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg">
                    <CheckCircle size={14} className="text-green-600"/>
                    <span className="text-green-700 font-bold text-sm">{cvFile.name}</span>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-600 font-medium">اضغط لرفع الملف أو اسحبه هنا</span>
                    <span className="text-gray-400 text-xs">صيغة PDF فقط (الحد الأقصى 5MB)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">ملاحظات إضافية (اختياري)</label>
            <textarea 
              rows={3}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 outline-none transition-all resize-none"
              placeholder="أي تفاصيل أخرى تود إخبارنا بها..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'تقديم طلب التفعيل'}
          </button>

        </form>
      </div>
    </div>
  );
}