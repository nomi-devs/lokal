export interface BilingualMessage {
  en: string;
  ar: string;
}

export const MESSAGES = {
  AUTH: {
    OTP_SENT: (target: string) => ({
      en: `OTP sent to ${target}`,
      ar: `تم إرسال رمز التحقق إلى ${target}`,
    }),
    OTP_VERIFIED: { en: 'Code verified', ar: 'تم التحقق من الرمز' },
    LOGGED_OUT: { en: 'Logged out successfully', ar: 'تم تسجيل الخروج بنجاح' },
    PASSWORD_RESET: {
      en: 'Password reset successfully',
      ar: 'تم إعادة تعيين كلمة المرور بنجاح',
    },
    FORGOT_PASSWORD: (email: string) => ({
      en: `If an account exists for ${email}, we've sent a reset code.`,
      ar: `إذا كان الحساب موجوداً لـ ${email}، فقد أرسلنا رمز إعادة التعيين.`,
    }),
  },
  USER: {
    PROFILE_UPDATED: {
      en: 'Profile updated successfully',
      ar: 'تم تحديث الملف الشخصي بنجاح',
    },
    PASSWORD_CHANGED: {
      en: 'Password changed successfully',
      ar: 'تم تغيير كلمة المرور بنجاح',
    },
    FCM_REGISTERED: {
      en: 'FCM token registered successfully',
      ar: 'تم تسجيل رمز الإشعارات بنجاح',
    },
    FCM_REMOVED: { en: 'FCM token removed', ar: 'تم حذف رمز الإشعارات' },
    ACCOUNT_DELETED: {
      en: 'Account deleted successfully',
      ar: 'تم حذف الحساب بنجاح',
    },
    DELETED: { en: 'User deleted permanently', ar: 'تم حذف المستخدم نهائياً' },
    STATUS_UPDATED: {
      en: 'User status updated',
      ar: 'تم تحديث حالة المستخدم',
    },
  },
  VENDOR: {
    REGISTRATION_SUCCESS: {
      en: 'Vendor registration successful',
      ar: 'تم تسجيل المتجر بنجاح',
    },
    APPROVED: {
      en: 'Vendor approved successfully',
      ar: 'تمت الموافقة على المتجر بنجاح',
    },
    REJECTED: { en: 'Vendor rejected', ar: 'تم رفض المتجر' },
    SUSPENDED: { en: 'Vendor suspended', ar: 'تم تعليق المتجر' },
  },
  CATEGORY: {
    DELETED: { en: 'Category deleted', ar: 'تم حذف الفئة' },
  },
  BANNER: {
    CREATED: {
      en: 'Banner created successfully',
      ar: 'تم إنشاء البانر بنجاح',
    },
    UPDATED: {
      en: 'Banner updated successfully',
      ar: 'تم تحديث البانر بنجاح',
    },
    DELETED: { en: 'Banner deleted', ar: 'تم حذف البانر' },
  },
  PRODUCT: {
    CREATED: {
      en: 'Product created successfully',
      ar: 'تم إنشاء المنتج بنجاح',
    },
    UPDATED: {
      en: 'Product updated successfully',
      ar: 'تم تحديث المنتج بنجاح',
    },
    DELETED: { en: 'Product deleted', ar: 'تم حذف المنتج' },
    APPROVED: {
      en: 'Product approved successfully',
      ar: 'تمت الموافقة على المنتج بنجاح',
    },
    REJECTED: { en: 'Product rejected', ar: 'تم رفض المنتج' },
  },
  ADDRESS: {
    CREATED: {
      en: 'Address added successfully',
      ar: 'تمت إضافة العنوان بنجاح',
    },
    UPDATED: {
      en: 'Address updated successfully',
      ar: 'تم تحديث العنوان بنجاح',
    },
    DELETED: { en: 'Address deleted', ar: 'تم حذف العنوان' },
    PRIMARY_SET: {
      en: 'Primary address updated',
      ar: 'تم تحديث العنوان الرئيسي',
    },
  },
  WISHLIST: {
    ADDED: { en: 'Added to wishlist', ar: 'تمت الإضافة إلى المفضلة' },
    REMOVED: { en: 'Removed from wishlist', ar: 'تمت الإزالة من المفضلة' },
  },
  PAYMENT: {
    CARD_REMOVED: {
      en: 'Saved card removed',
      ar: 'تمت إزالة البطاقة المحفوظة',
    },
  },
  REVIEW: {
    SUBMITTED: {
      en: 'Review submitted — it will appear once approved',
      ar: 'تم إرسال التقييم — سيظهر بعد الموافقة عليه',
    },
    DELETED: { en: 'Review deleted', ar: 'تم حذف التقييم' },
    APPROVED: { en: 'Review approved', ar: 'تمت الموافقة على التقييم' },
    REJECTED: { en: 'Review rejected', ar: 'تم رفض التقييم' },
  },
  ORDER: {
    CANCELLED: { en: 'Order cancelled', ar: 'تم إلغاء الطلب' },
    STATUS_UPDATED: { en: 'Order status updated', ar: 'تم تحديث حالة الطلب' },
    PAYMENT_CONFIRMED: {
      en: 'Payment received — your order is confirmed',
      ar: 'تم استلام الدفعة — تم تأكيد طلبك',
    },
  },
  NOTIFICATION: {
    MARKED_READ: {
      en: 'Notification marked as read',
      ar: 'تم تحديد الإشعار كمقروء',
    },
    ALL_MARKED_READ: {
      en: 'All notifications marked as read',
      ar: 'تم تحديد كل الإشعارات كمقروءة',
    },
    SETTINGS_UPDATED: {
      en: 'Notification settings updated',
      ar: 'تم تحديث إعدادات الإشعارات',
    },
    VENDOR_MESSAGE_SENT: {
      en: 'Message sent to vendor(s)',
      ar: 'تم إرسال الرسالة إلى التاجر (التجار)',
    },
  },
  COMMON: {
    SUCCESS: { en: 'Success', ar: 'تمت العملية بنجاح' },
    NOT_FOUND: { en: 'Not found', ar: 'غير موجود' },
    UNAUTHORIZED: { en: 'Unauthorized', ar: 'غير مصرح' },
    FORBIDDEN: { en: 'Forbidden', ar: 'ممنوع' },
    VALIDATION_ERROR: { en: 'Validation failed', ar: 'فشل التحقق من البيانات' },
    INTERNAL_ERROR: {
      en: 'Internal server error. Please try again.',
      ar: 'خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى.',
    },
  },
} as const;

export function statusToBilingual(status: number): BilingualMessage {
  switch (status) {
    case 400:
      return MESSAGES.COMMON.VALIDATION_ERROR;
    case 401:
      return MESSAGES.COMMON.UNAUTHORIZED;
    case 403:
      return MESSAGES.COMMON.FORBIDDEN;
    case 404:
      return MESSAGES.COMMON.NOT_FOUND;
    default:
      return status >= 500
        ? MESSAGES.COMMON.INTERNAL_ERROR
        : MESSAGES.COMMON.SUCCESS;
  }
}
