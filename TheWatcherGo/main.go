package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// تحميل ملف .env وطباعة الخطأ إن وجد
	err := godotenv.Load()
	if err != nil {
		fmt.Println("⚠️ تحذير: لم يتم العثور على ملف .env (هذا طبيعي في Coolify، لكن خطأ محلياً)")
	}

	// طباعة القيم الحالية للتأكد
	fmt.Println("DEBUG: DB URL Length:", len(os.Getenv("DATABASE_URL")))
	fmt.Println("DEBUG: Webhook URL:", os.Getenv("N8N_WEBHOOK_URL"))

	// 1. قراءة الإعدادات
	dbURL := os.Getenv("DATABASE_URL")
	n8nWebhookURL := os.Getenv("N8N_WEBHOOK_URL")

	if dbURL == "" || n8nWebhookURL == "" {
		log.Fatal("❌ خطأ: المتغيرات DATABASE_URL أو N8N_WEBHOOK_URL غير موجودة")
	}

	// 2. الاتصال بقاعدة البيانات
	// نقوم بتعطيل تشفير SSL إذا كان الرابط لا يدعمه لتجنب المشاكل
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("❌ فشل فتح الاتصال بقاعدة البيانات:", err)
	}
	defer db.Close()

	// اختبار الاتصال الفعلي
	err = db.Ping()
	if err != nil {
		log.Fatal("❌ لا يمكن الوصول للسيرفر (Ping Failed):", err)
	}

	fmt.Println("👁️  The Watcher started... waiting for targets.")

	// 3. إعداد المؤقت (كل دقيقة)
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	// فحص فوري عند التشغيل
	checkAndTrigger(db, n8nWebhookURL)

	// حلقة المراقبة المستمرة
	for range ticker.C {
		checkAndTrigger(db, n8nWebhookURL)
	}
}

func checkAndTrigger(db *sql.DB, webhookURL string) {
	// الاستعلام: هل يوجد أي ومضة مستحقة الإرسال الآن؟
	// الشروط المعدلة:
	// 1. الحالة معلقة (is_sent_status = 'pending') ✅ تم التعديل
	// 2. وقتها حان (scheduled_time <= NOW)
	// 3. لم يمر عليها أكثر من 15 دقيقة (لتجنب الومضات القديمة جداً)
	// 4. اللاعب نشط والواتساب متصل
	query := `
		SELECT EXISTS (
			SELECT 1
			FROM job_game.flash_logs l
			JOIN job_game.players p ON l.player_id = p.player_id
			WHERE 
				l.is_sent_status = 'pending' 
				AND l.scheduled_time <= NOW()
				AND l.scheduled_time >= NOW() - INTERVAL '15 minutes'
				AND p.status = 'active'
				AND p.evo_connection_status = 'connected'
		);`

	var exists bool
	err := db.QueryRow(query).Scan(&exists)
	if err != nil {
		log.Println("⚠️ خطأ أثناء الاستعلام:", err)
		// في حال انقطع الاتصال، نحاول إعادة الاتصال في الدورة القادمة
		return
	}

	if exists {
		fmt.Println("🚨 تم رصد ومضات مستحقة! إرسال إشارة إلى n8n...")

		// إرسال طلب فارغ فقط لإيقاظ المحرك
		payload := map[string]string{
			"source": "TheWatcher",
			"event":  "flash_pending",
			"time":   time.Now().String(),
		}
		jsonBody, _ := json.Marshal(payload)

		// إرسال الويب هوك مع مهلة زمنية (Timeout)
		client := http.Client{
			Timeout: 10 * time.Second,
		}

		resp, err := client.Post(webhookURL, "application/json", bytes.NewBuffer(jsonBody))
		if err != nil {
			log.Println("❌ فشل الاتصال بـ n8n:", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			fmt.Println("✅ تم تسليم الإشارة بنجاح.")
		} else {
			fmt.Printf("⚠️ استجابة غير متوقعة من n8n: %d\n", resp.StatusCode)
		}

	} else {
		// طباعة نقطة فقط للدلالة على أن النظام يعمل
		//fmt.Print(".")
	}
}
