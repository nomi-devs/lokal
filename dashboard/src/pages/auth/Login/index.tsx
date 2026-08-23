// src/pages/auth/Login/index.tsx
import { useState } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Store } from "lucide-react";

import type { AppDispatch, RootState } from "@/store";
import { loginAsync } from "@/store/slices/authSlice";
import { APP_CONFIG } from "@/config";
import TopBanner from "@/components/layout/TopBanner";
import DynamicForm from "@/components/form/DynamicForm";
import type { FieldConfig } from "@/components/form/DynamicForm";
import { toast } from "@/components/ui/Toast";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

// Real accounts on the local-be backend: the seeded admin (see
// local-be's `npm run seed:admin`) plus any vendor already approved there.
// Update these once your own seed/vendor data differs.
const DEMO_ACCOUNTS = [
  {
    role: "admin" as const,
    icon: ShieldCheck,
    email: "admin@lokal.com",
    password: "ChangeMe123!",
  },
  {
    role: "vendor" as const,
    icon: Store,
    email: "ahmed@store.com",
    password: "VendorPass123",
  },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const [quickFill, setQuickFill] = useState<{ email: string; password: string } | null>(null);

  const loginFields: FieldConfig[] = [
    {
      name: "email",
      label: t("auth.login.emailLabel"),
      type: "email",
      placeholder: "you@example.com",
      autocomplete: "email",
      col: 12,
    },
    {
      name: "password",
      label: t("auth.login.passwordLabel"),
      type: "password",
      placeholder: "••••••••",
      autocomplete: "current-password",
      col: 12,
    },
  ];

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await dispatch(loginAsync({ identifier: values.email, password: values.password })).unwrap();
      toast.success(t("auth.login.successBody"), { title: t("auth.login.successTitle") });
    } catch (error) {
      toast.error(error as string, { title: t("auth.login.failTitle") });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-300 px-4">
        <div className="w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Branding */}
          <div className="mb-6 text-center">
            <img src={APP_CONFIG.logo} alt="Logo" className="mx-auto h-12 mb-2" />
            <h1 className="text-2xl font-bold text-primary">{t("auth.login.title")}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("auth.login.subtitle")}</p>
          </div>

          {/* Form */}
          <DynamicForm
            schema={loginSchema}
            fields={loginFields}
            defaultValues={{
              email: "admin@lokal.com",
              password: "ChangeMe123!",
            }}
            values={quickFill ?? undefined}
            onSubmit={onSubmit}
            submitText={t("auth.login.submit")}
            isSubmitting={isLoading}
          />

          {/* Demo accounts */}
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
              {t("auth.login.demoAccounts")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => setQuickFill({ email: account.email, password: account.password })}
                  className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-center transition-colors hover:bg-primary/5 hover:border-primary/40"
                >
                  <account.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">
                    {t(`auth.login.demoRole.${account.role}`)}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate w-full">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between text-sm text-center sm:text-left">
            <Link to="/forgot-password" className="text-primary-light hover:underline">
              {t("auth.login.forgotPassword")}
            </Link>
            <span className="mt-2 sm:mt-0">
              {t("auth.login.noAccount")}{" "}
              <Link to="/register" className="text-primary-light hover:underline">
                {t("auth.login.register")}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
