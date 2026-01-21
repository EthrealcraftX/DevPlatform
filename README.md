# DevPlatform — Self‑Hosted PaaS (Heroku/Railway uslubida)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

DevPlatform — bu **Heroku/Railway** kabi platformalarning self‑hosted versiyasi: Node.js, Python va Java ilovalarini bir joydan **yaratish, joylash, ishga tushirish, monitoring qilish** va **boshqarish** imkonini beradi. Loyiha kichik jamoalar, startup va ichki infratuzilma uchun PaaS tajribasini tezda joriy etishga mo‘ljallangan.

---

## 🚀 Imkoniyatlar

- **GitHub repodan import** va loyiha yaratish
- **Main file** va **stack** tanlash (Node.js / Python / Java)
- **Start / Stop / Delete** bilan lifecycle boshqaruvi
- **Real‑time** disk usage va internet tezlik monitoringi
- **File manager**: ko‘rish, o‘chirish, upload
- **Onlayn kod editor** (CodeMirror)
- **Live console logs** va input stream
- **Admin panel**: foydalanuvchilarni boshqarish (admin qilish, o‘chirish, statistikalar)
- **Email xabarnomalar** (Brevo SMTP integratsiyasi)

---

## 🧩 Texnologiyalar

- Backend: **Node.js** (Express)
- Real‑time: **Socket.IO**
- Editor: **CodeMirror**
- SMTP: **Brevo**

---

## ⚙️ O‘rnatish (Local)

```bash
git clone https://github.com/EthrealcraftX/DevPlatform.git
cd DevPlatform
npm install
```

Serverni ishga tushirish:

```bash
node app.js
```

---

## 🔐 Login va Admin

Ro‘yxatdan o‘tgan foydalanuvchilar ichidan admin orqali ruxsat beriladi.

**Admin yo‘llari:**

```
/admin
/admin/users
/admin/stats
```

**Foydalanuvchi yo‘llari:**

```
/home
/login
/register
```

---

## 📁 Foydalanish bosqichlari

1. Ro‘yxatdan o‘ting va admin tasdiqlashini kuting.
2. **Create Project** bo‘limiga o‘ting.
3. GitHub repozitoriyasini import qiling.
4. Stack va main faylni tanlang (Node.js/Python/Java).
5. **Create Project** tugmasini bosing.
6. Loyiha holatini boshqaring: **Start/Stop**, loglarni ko‘ring, fayllarni tahrirlang.

---

## ⚠️ Eslatmalar

- Platforma **faol ishlab chiqilmoqda** — ba’zi funksiyalar ustida ish davom etmoqda.
- Java `.jar` qo‘llab‑quvvatlashi **asosiy** ko‘rinishda.
- SMTP sozlamalari Brevo uchun sinovdan o‘tgan ( `services/emailService.js` ).
- Upload qilingan fayllar `uploads/` ichida saqlanadi.

---

## 🛡 License

MIT License — erkin foydalanish va moslashtirish mumkin.

---

## 👨‍💻 Muallif

Developed by **EthrealCraftX**  
Telegram: @ethrealcraft  
GitHub: https://github.com/EthrealcraftX

---

## ⭐ Hissa qo‘shish

Taklif va PR’lar xush kelibsiz. Agar loyiha foydali bo‘lsa, iltimos ⭐ bosing.
