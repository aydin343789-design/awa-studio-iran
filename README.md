# آوای ایران آزاد (Avaye Iran-e Azad)

تبدیل متن فارسی/انگلیسی به گفتار — کاملاً آفلاین، بدون هیچ API ابری، مدل هوش مصنوعی یا کلید API.
تمام تولید صدا با Web Audio API (سنتز فورمنت روی دستگاه) و `window.speechSynthesis` انجام می‌شود.

## اجرای محلی (فقط برای توسعه)
```bash
npm install
npm run dev
```

## ساخت نسخه وب
```bash
npm run build
```

## ساخت APK اندروید
1. مخزن گیت‌هاب بسازید و کد را push کنید:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
2. به تب **Actions** در گیت‌هاب بروید؛ وقتی وضعیت اکشن سبز شد (build-apk.yml)، وارد اجرای آن شوید.
3. در پایین صفحه‌ی اجرا، بخش **Artifacts** را باز کنید و فایل `AvayeIranAzad-APK` را دانلود کنید — این یک zip حاوی `app-debug.apk` است.
4. فایل APK را روی گوشی اندروید نصب کنید (ممکن است لازم باشد نصب از منابع ناشناس را فعال کنید).

## نکته درباره‌ی خروجی MP3
برای انکود واقعی MP3 به‌صورت کامل آفلاین، کتابخانه‌ی سبک `lamejs` (بدون هیچ فراخوانی شبکه) به `dependencies` اضافه شده است؛ در غیر این صورت خروجی MP3 معتبر امکان‌پذیر نبود.
