# FIT ERA — دليل ربط المتجر مع باك إند Laravel (PHP)
## Complete Laravel Integration & Architecture Guide

تم فحص واختبار كامل كود الفرونت إند والتأكد من خلوه من أي أخطاء أو أعطال، وتم تجهيز البنية بالكامل للربط المباشر مع **PHP Laravel Backend**.

---

### خيارات الربط المتاحة (Choose Your Architecture)

يدعم كود المتجر طريقتين احترافيتين للربط:

#### 1. طريقة REST API (موصى بها لأقصى مرونة وسرعة - SPA + Laravel API)
- الفرونت إند React يعمل كـ SPA ويتواصل مع مسارات `/api/*` في Laravel.
- تم تجهيز الملف `resources/js/lib/api.js` بحيث يرسل طلبات HTTP حقيقية مع الـ CSRF Tokens (`X-CSRF-TOKEN` / `X-XSRF-TOKEN`).
- **ميزة الهجين التلقائي (Hybrid Fallback):** إذا لم يكن الباك إند يعمل مؤقتاً أثناء التطوير، ينتقل الموقع تلقائياً إلى التخزين المحلي بدون أن ينهار أي جزء في الموقع.

#### 2. طريقة Laravel + Inertia.js (Monolithic Single-Repo)
- الملف `resources/js/app.jsx` مجهز مسبقاً بـ `createInertiaApp` لربط صفحات المتجر مباشرة مع Laravel Controllers عبر `Inertia::render()`.
- كل صفحة في `resources/js/Pages` تقابل مساراً مباشراً في `routes/web.php`.

---

### ملفات Laravel الجاهزة المرفقة في المشروع

قمنا بتجهيز مجلد كامل `laravel/` يحتوي على كل ما تحتاجه للنسخ في مشروع Laravel الخاص بك:

```
laravel/
├── database/
│   └── migrations/
│       └── 2026_01_01_000000_create_fitera_tables.php    # جداول (المنتجات، الطلبات، الخصومات، التصنيفات، الباقات)
├── routes/
│   ├── api.php                                            # مسارات الـ API للطلبات والتتبع والمنتجات
│   └── web.php                                            # مسارات Inertia.js في حال رغبت باستخدامه
├── app/
│   ├── Http/Controllers/
│   │   ├── OrderController.php                            # استقبال الطلبات، التتبع برقم FE-xxxx، وتحديث الحالات
│   │   ├── ProductController.php                          # استعراض وإضافة وتعديل وحذف المنتجات
│   │   ├── DiscountController.php                         # التحقق من كود الخصم (FIT15 وغيرها)
│   │   └── AuthController.php                             # تسجيل دخول وخروج العملاء والمديرين
│   └── Models/
│       ├── Order.php                                      # موديل الطلبات مع تحويل الحقول تلقائياً
│       ├── OrderItem.php                                  # موديل عناصر الطلب (المنتج، اللون، المقاس، الكمية)
│       └── Product.php                                    # موديل المنتجات
```

---

### خطوات التشغيل السريعة مع Laravel (Quick Setup Steps)

#### الخطوة 1: نسخ الملفات
1. انقل محتويات `resources/` (بما فيها `resources/js/` و `resources/css/`) إلى مجلد مشروع Laravel الخاص بك.
2. انقل ملفات `laravel/database/migrations/` إلى مجلد `database/migrations/` في مشروع Laravel.
3. انقل الكنترولرز والموديلز من `laravel/app/` إلى `app/` في Laravel.
4. أضف المسارات من `laravel/routes/api.php` إلى `routes/api.php` في Laravel.

#### الخطوة 2: تشغيل الـ Migrations
```bash
php artisan migrate
```

#### الخطوة 3: ملف البيئة `.env` في Laravel
```env
APP_NAME="FIT ERA"
APP_URL=http://localhost:8000

# تمكين Sanctum و CORS
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

#### الخطوة 4: تشغيل الـ Vite وسيرفر Laravel
```bash
# في نافذة Terminal 1:
php artisan serve

# في نافذة Terminal 2:
npm run dev
```

---

### جدول تطابق الحقول بين React و Laravel (Payload Contract)

#### طلب إضافة أوردر جديد (`POST /api/orders`):
```json
{
  "customer": {
    "name": "كريم أحمد",
    "whatsapp": "01012345678",
    "email": "karim@example.com"
  },
  "shipping": {
    "city": "Cairo",
    "address": "15 شارع النيل، الزمالك، الدور الرابع",
    "notes": "الاتصال قبل الوصول"
  },
  "payment": "cod",
  "code": "FIT15",
  "total": 1148,
  "items": [
    {
      "id": "tee-sand",
      "name": "Essential Heavyweight Tee",
      "colorName": "Sand Beige",
      "size": "M",
      "qty": 2,
      "price": 549,
      "hex": "#d6c5ad",
      "image": "/images/tee-sand.jpg"
    }
  ]
}
```

#### استجابة تتبع الأوردر (`GET /api/orders/{number}?phone=01012345678`):
```json
{
  "order": {
    "number": "FE-1042",
    "step": 2,
    "customer": { "name": "كريم أحمد", "whatsapp": "01012345678" },
    "total": 1148,
    "payment": "cod",
    "createdAt": 1727600000000,
    "items": [ ... ]
  }
}
```

---

### نتائج الفحص والاختبار (Code Audit Results)
- **Compilation:** ناجح 100% (`vite build` نجح بدون أي تحذيرات أخطاء).
- **Linter:** خالي تماماً من المشاكل والمكتبات الناقصة.
- **Routing:** يدعم المسارات المباشرة والتنقل الداخلي (`/`, `/shop`, `/product/:slug`, `/checkout`, `/order/:number`, `/track`, `/admin`).
- **Security:** فصل كامل بين لوحة تحكم الأدمن والزوار مع حماية CSRF جاهزة لـ Laravel Sanctum.
