import { z } from "zod";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AppDispatch } from "@/store";
import { register } from "@/store/slices/authSlice";
import TopBanner from "@/components/layout/TopBanner";
import DynamicForm from "@/components/form/DynamicForm";
import type { FieldConfig } from "@/components/form/DynamicForm";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const registerFields: FieldConfig[] = [
    {
      name: "name",
      label: t("auth.register.nameLabel"),
      type: "text",
      placeholder: "John Doe",
      autocomplete: "name",
      col: 12,
    },
    {
      name: "email",
      label: t("auth.register.emailLabel"),
      type: "email",
      placeholder: "you@example.com",
      autocomplete: "email",
      col: 12,
    },
    {
      name: "password",
      label: t("auth.register.passwordLabel"),
      type: "password",
      placeholder: "••••••••",
      autocomplete: "new-password",
      col: 12,
    },
    {
      name: "confirmPassword",
      label: t("auth.register.confirmPasswordLabel"),
      type: "password",
      placeholder: "••••••••",
      autocomplete: "new-password",
      col: 12,
    },
  ];

  function onSubmit(values: z.infer<typeof registerSchema>) {
    console.log("Register attempt:", values);
    dispatch(register(values));
  }

  function getStrength(pw: string) {
    if (!pw) {
      return { label: "", color: "" };
    }

    if (pw.length < 6) {
      return { label: t("auth.register.strength.weak"), color: "bg-red-500" };
    }

    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[!@#$%^&*]/.test(pw)) {
      return { label: t("auth.register.strength.medium"), color: "bg-yellow-500" };
    }

    return { label: t("auth.register.strength.strong"), color: "bg-green-500" };
  }

  const strength = getStrength(password);
  const passwordsMatch = confirmPassword === password;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-3 text-primary dark:text-white">
            {t("auth.register.title")}
          </h1>

          <DynamicForm
            schema={registerSchema}
            fields={registerFields}
            defaultValues={{
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            onSubmit={onSubmit}
            submitText={t("auth.register.submit")}
            // Track password values for live feedback
            onChange={(name, value) => {
              if (name === "password") {
                setPassword(value);
              }

              if (name === "confirmPassword") {
                setConfirmPassword(value);
              }
            }}
          />

          {/* Password strength indicator */}
          <div className="mt-2 min-h-[24px]">
            {strength.label && (
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-20 rounded", strength.color)} />
                <span className="text-sm text-gray-600 dark:text-gray-300">{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm password live check */}
          <div className="mt-1 min-h-[10px]">
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500">{t("auth.register.passwordsDontMatch")}</p>
            )}
          </div>

          {/* Links Section */}
          <div className="mt-2 flex flex-col sm:flex-row sm:justify-between text-sm text-center sm:text-left">
            <Link to="/login" className="text-blue-500 hover:underline dark:text-blue-400">
              {t("auth.register.backToLogin")}
            </Link>
            <span className="mt-2 sm:mt-0">
              {t("auth.register.forgotOldOne")}{" "}
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:underline dark:text-blue-400"
              >
                {t("auth.register.resetPassword")}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
