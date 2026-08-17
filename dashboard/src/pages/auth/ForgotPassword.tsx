// src/pages/auth/ForgotPassword.tsx
import { z } from "zod";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { APP_CONFIG } from "@/config";
import TopBanner from "@/components/layout/TopBanner";
import DynamicForm from "@/components/form/DynamicForm";
import type { FieldConfig } from "@/components/form/DynamicForm";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  const forgotPasswordFields: FieldConfig[] = [
    {
      name: "email",
      label: t("auth.forgotPassword.emailLabel"),
      type: "email",
      placeholder: "you@example.com",
      autocomplete: "email",
      col: 12,
    },
  ];

  function onSubmit(_values: z.infer<typeof forgotPasswordSchema>) {
    console.log("Forgot password request:", _values);
    // TODO: Trigger password reset API
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-300 px-4">
        <div className="w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Branding */}
          <div className="mb-6 text-center">
            <img src={APP_CONFIG.logo} alt="Logo" className="mx-auto h-12 mb-2" />
            <h1 className="text-2xl font-bold text-primary">{t("auth.forgotPassword.title")}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.forgotPassword.subtitle")}
            </p>
          </div>

          {/* Form */}
          <DynamicForm
            schema={forgotPasswordSchema}
            fields={forgotPasswordFields}
            defaultValues={{ email: "" }}
            onSubmit={onSubmit}
            submitText={t("auth.forgotPassword.submit")}
          />

          {/* Links */}
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between text-sm text-center sm:text-left">
            <Link to="/login" className="text-primary-light hover:underline">
              {t("auth.forgotPassword.backToLogin")}
            </Link>
            <span className="mt-2 sm:mt-0">
              {t("auth.forgotPassword.noAccount")}{" "}
              <Link to="/register" className="text-primary-light hover:underline">
                {t("auth.forgotPassword.register")}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
