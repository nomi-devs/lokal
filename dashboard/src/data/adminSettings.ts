// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Shape mirrors the ADMIN_SETTINGS collection in the ERD (a generic key/value config store).
export type SettingType = "number" | "string" | "boolean" | "json";
export type SettingCategory = "payment" | "shipping" | "commission" | "sms" | "auth" | "general";

export type AdminSetting = {
  id: number;
  key: string;
  value: string | number | boolean;
  type: SettingType;
  category: SettingCategory;
  descriptionEn: string;
  descriptionAr: string;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
};

export const adminSettings: AdminSetting[] = [
  {
    id: 1,
    key: "SHIPPING_FEE",
    value: 3,
    type: "number",
    category: "shipping",
    descriptionEn: "Flat shipping fee applied to every order.",
    descriptionAr: "رسوم شحن ثابتة تُطبق على كل طلب.",
    updatedBy: 1,
    createdAt: "2025-01-01",
    updatedAt: "2026-07-01",
  },
  {
    id: 2,
    key: "COMMISSION_TYPE",
    value: "percentage",
    type: "string",
    category: "commission",
    descriptionEn: "Default commission model for new vendors.",
    descriptionAr: "نموذج العمولة الافتراضي للموردين الجدد.",
    updatedBy: 1,
    createdAt: "2025-01-01",
    updatedAt: "2026-05-12",
  },
  {
    id: 3,
    key: "COMMISSION_VALUE",
    value: 12,
    type: "number",
    category: "commission",
    descriptionEn: "Default commission percentage for new vendors.",
    descriptionAr: "نسبة العمولة الافتراضية للموردين الجدد.",
    updatedBy: 1,
    createdAt: "2025-01-01",
    updatedAt: "2026-05-12",
  },
  {
    id: 4,
    key: "OTP_EXPIRY",
    value: 300,
    type: "number",
    category: "auth",
    descriptionEn: "OTP validity window, in seconds.",
    descriptionAr: "مدة صلاحية رمز التحقق بالثواني.",
    updatedBy: 5,
    createdAt: "2025-01-01",
    updatedAt: "2026-03-20",
  },
  {
    id: 5,
    key: "JWT_EXPIRY",
    value: 86400,
    type: "number",
    category: "auth",
    descriptionEn: "Access token lifetime, in seconds.",
    descriptionAr: "مدة صلاحية رمز الدخول بالثواني.",
    updatedBy: 5,
    createdAt: "2025-01-01",
    updatedAt: "2026-03-20",
  },
  {
    id: 6,
    key: "PAYMENT_GATEWAY",
    value: "myfatoorah",
    type: "string",
    category: "payment",
    descriptionEn: "Primary payment gateway for checkout.",
    descriptionAr: "بوابة الدفع الأساسية عند إتمام الطلب.",
    updatedBy: 1,
    createdAt: "2025-01-01",
    updatedAt: "2026-06-18",
  },
  {
    id: 7,
    key: "SMS_SENDER_ID",
    value: "LOKAL",
    type: "string",
    category: "sms",
    descriptionEn: "Sender ID shown on outbound SMS messages.",
    descriptionAr: "اسم المرسل الظاهر في الرسائل النصية.",
    updatedBy: 10,
    createdAt: "2025-01-01",
    updatedAt: "2026-02-08",
  },
  {
    id: 8,
    key: "MAINTENANCE_MODE",
    value: false,
    type: "boolean",
    category: "general",
    descriptionEn: "When enabled, the storefront shows a maintenance page.",
    descriptionAr: "عند التفعيل، يعرض المتجر صفحة الصيانة.",
    updatedBy: 1,
    createdAt: "2025-01-01",
    updatedAt: "2026-08-01",
  },
];
