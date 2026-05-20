# Appreciation Card Studio

تم تصميم هذا المشروع باستخدام TanStack Router و React و TailwindCSS.

## التثبيت

```bash
npm install
```

## التشغيل المحلي

```bash
npm run dev
```

## البناء

```bash
npm run build
```

## النشر على Render

### المتطلبات

1. حساب على [Render](https://render.com)
2. مستودع Git يحتوي على هذا المشروع

### خطوات النشر

1. **إعداد المستودع**
   - تأكد من دفع الكود إلى GitHub/GitLab/Bitbucket
   - تأكد من وجود ملف `render.yaml` في جذر المشروع

2. **إنشاء Web Service جديد على Render**
   - سجل الدخول إلى [Render Dashboard](https://dashboard.render.com)
   - اضغط على "New +" ثم "Web Service"
   - قم بربط المستودع Git الخاص بك
   - سيكتشف Render تلقائياً ملف `render.yaml`

3. **الإعدادات**
   - الاسم: appreciation-card-studio
   - المنطقة: اختر المنطقة الأقرب لجمهورك
   - الخطة: Free (أو Paid حسب احتياجاتك)
   - متغيرات البيئة: أضف أي متغيرات بيئية مطلوبة

4. **النشر**
   - اضغط على "Create Web Service"
   - سيقوم Render ببناء ونشر المشروع تلقائياً
   - يمكنك مراقبة عملية النشر في قسم "Deployments"

### ملفات التكوين

- `render.yaml` - تكوين النشر على Render
- `.env.example` - مثال على متغيرات البيئة المطلوبة
- `package.json` - سكريبتات البناء والتشغيل

### استكشاف الأخطاء

إذا واجهت مشاكل في النشر:

1. تحقق من سجلات البناء في Render Dashboard
2. تأكد من أن جميع الاعتماديات مثبتة بشكل صحيح
3. تحقق من أن سكريبت `build` يعمل محلياً
4. تأكد من أن سكريبت `start` يعمل محلياً

## ملاحظات مهمة

- هذا المشروع يستخدم TanStack Router (SPA)
- تم تحويله من TanStack Start (SSR) للعمل على Render
- لا يحتاج إلى Cloudflare Workers

## الدعم

إذا واجهت أي مشاكل، يرجى:
1. فتح Issue في المستودع
2. مراجعة وثائق [TanStack Router](https://tanstack.com/router/latest)
3. مراجعة وثائق [Render](https://render.com/docs)
