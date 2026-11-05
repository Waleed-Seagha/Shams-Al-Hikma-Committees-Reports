# موقع محاضر وخطط اللجان (عرض فقط) — بدون Google Cloud

## 1) ربط الشيت (مرة واحدة، من Apps Script فقط)
1. افتح الشيت ← الإضافات (Extensions) ← Apps Script.
2. أضف ملفاً جديداً باسم `api` والصق فيه محتوى `api.gs`.
3. انشر: Deploy ← New deployment ← النوع **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. وافق على الصلاحيات، ثم انسخ رابط **Web app URL** (ينتهي بـ `/exec`).
5. الصقه في `config.js` داخل `WEB_APP_URL`.

> عند تعديل `api.gs` لاحقاً: Deploy ← Manage deployments ← Edit ← New version.

## 2) الرفع على GitHub
ارفع كل الملفات (ليس `api.gs` ضرورياً)، ثم Settings ← Pages ← Branch: main.

الأشهر الجديدة تظهر تلقائياً. الطباعة: زر "طباعة" (فعّل "رسومات الخلفية").
