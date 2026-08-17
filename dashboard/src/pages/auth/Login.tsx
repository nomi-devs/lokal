// src/pages/auth/Login.tsx
import { z } from "zod";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import type { AppDispatch, RootState } from "@/store";
import { store } from "@/store";
import { login } from "@/store/slices/authSlice";
import { APP_CONFIG } from "@/config";
import TopBanner from "@/components/layout/TopBanner";
import DynamicForm from "@/components/form/DynamicForm";
import type { FieldConfig } from "@/components/form/DynamicForm";
import { toast } from "@/components/ui/Toast";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

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

  function onSubmit(values: z.infer<typeof loginSchema>) {
    dispatch(login(values));
    const { error, isAuthenticated } = (store.getState() as RootState).auth;

    if (isAuthenticated) {
      toast.success(t("auth.login.successBody"), { title: t("auth.login.successTitle") });
    } else if (error) {
      toast.error(error, { title: t("auth.login.failTitle") });
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
              email: "admin@gmail.com",
              password: "admin123",
            }}
            onSubmit={onSubmit}
            submitText={t("auth.login.submit")}
          />

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
