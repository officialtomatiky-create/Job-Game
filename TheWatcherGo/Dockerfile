# 1. مرحلة البناء (Builder Stage)
FROM golang:alpine AS builder

# إعداد مسار العمل
WORKDIR /app

# نسخ ملفات تعريف المشروع
COPY go.mod go.sum ./
# تحميل المكتبات
RUN go mod download

# نسخ باقي الكود
COPY *.go ./

# بناء الملف التنفيذي باسم "watcher"
RUN go build -o watcher .

# 2. مرحلة التشغيل (Runner Stage)
# نستخدم صورة alpine صغيرة جداً وخفيفة
FROM alpine:latest  

WORKDIR /root/

# نسخ الملف التنفيذي من المرحلة السابقة
COPY --from=builder /app/watcher .

# تشغيل المراقب
CMD ["./watcher"]