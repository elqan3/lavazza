// src/utils/validation.ts

// ======================================================
// الكلمات والأسماء الممنوعة
// ======================================================

export const BANNED_NAMES = [
  // أسماء وهمية / تجريبية
  "admin",
  "administrator",
  "administrator1",
  "admin1",
  "root",
  "test",
  "testuser",
  "testing",
  "user",
  "user1",
  "user123",
  "guest",
  "guest1",
  "unknown",
  "anonymous",
  "anon",
  "null",
  "undefined",
  "none",
  "nobody",
  "fake",
  "fakeuser",
  "dummy",
  "example",
  "exampleuser",
  "demo",
  "developer",
  "dev",

  // أسماء النظام / الإدارة
  "moderator",
  "mod",
  "staff",
  "support",
  "official",
  "officialaccount",
  "system",
  "bot",
  "robot",
  "security",
  "manager",
  "owner",
  "superadmin",
  "superuser",

  // العربية
  "مجهول",
  "مستخدم",
  "مستخدم مجهول",
  "ادمن",
  "أدمن",
  "الادمن",
  "الأدمن",
  "مشرف",
  "مشرفة",
  "مدير",
  "مديرة",
  "مسؤول",
  "مسؤولة",
  "المسؤول",
  "الدعم",
  "دعم فني",
  "الإدارة",
  "الادارة",
  "إدارة",
  "النظام",
  "بوت",
  "روبوت",
  "حساب رسمي",
  "رسمي",
  "المشرف",
  "المشرفة",

  // أسماء غير حقيقية شائعة
  "لا أحد",
  "لاحد",
  "لاشيء",
  "لا شيء",
  "بدون اسم",
  "بدون",
  "اسم",
  "اسمي",
  "شخص",
  "شخص مجهول",
  "مستخدم جديد",
  "حساب تجريبي",
  "حساب وهمي",
  "تجربة",
  "تجريبي",
] as const;


// ======================================================
// تطبيع النص
// ======================================================

export function normalizeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}


// ======================================================
// التحقق من الاسم
// ======================================================

export function validateName(name: string): string | null {
  const cleanName = name.trim();

  if (!cleanName) {
    return "أدخل اسمك الكامل";
  }

  if (Array.from(cleanName).length > 15) {
    return "الاسم يجب ألا يتجاوز 15 حرفًا";
  }

  const normalizedName = normalizeName(cleanName);

  const isBanned = BANNED_NAMES.some(
    (banned) =>
      normalizeName(banned) === normalizedName
  );

  if (isBanned) {
    return "هذا الاسم غير مسموح باستخدامه";
  }

  return null;
}


// ======================================================
// التحقق من رقم الهاتف
// ======================================================

const PHONE_REGEX = /^(091|092|093|094|095)\d{7}$/;

export function validatePhone(phone: string): string | null {
  if (!phone) {
    return "أدخل رقم الهاتف";
  }

  if (!/^\d+$/.test(phone)) {
    return "رقم الهاتف يجب أن يحتوي على أرقام فقط";
  }

  if (phone.length !== 10) {
    return "رقم الهاتف يجب أن يتكون من 10 أرقام";
  }

  if (!PHONE_REGEX.test(phone)) {
    return "رقم الهاتف يجب أن يبدأ بـ 091 أو 092 أو 093 أو 094 أو 095";
  }

  return null;
}