// src/pages/auth/ForgotPassword/index.tsx
import { useEffect, useState } from "react";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

import { APP_CONFIG } from "@/config";
import { forgotPassword, resetPassword, verifyResetOtp } from "@/lib/authApi";
import { getApiErrorMessage } from "@/lib/apiClient";
import TopBanner from "@/components/layout/TopBanner";
import DynamicForm from "@/components/form/DynamicForm";
import type { FieldConfig } from "@/components/form/DynamicForm";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/OtpInput";
import { toast } from "@/components/ui/Toast";

const OTP_RESEND_SECONDS = 30;

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// 3 screens, each its own step: (1) collect email, (2) verify the emailed
// code on its own (via verifyResetOtp, which checks but doesn't consume the
// OTP), (3) only then show the new-password fields — resetPassword's own
// otpService.verify() does the actual (consuming) check server-side.
type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resendIn, setResendIn] = useState(0);

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

  const resetPasswordFields: FieldConfig[] = [
    {
      name: "newPassword",
      label: t("auth.forgotPassword.reset.newPasswordLabel"),
      type: "password",
      placeholder: "••••••••",
      autocomplete: "new-password",
      col: 12,
    },
    {
      name: "confirmPassword",
      label: t("auth.forgotPassword.reset.confirmPasswordLabel"),
      type: "password",
      placeholder: "••••••••",
      autocomplete: "new-password",
      col: 12,
    },
  ];

  useEffect(() => {
    if (resendIn <= 0) {
      return;
    }

    const id = setInterval(() => setResendIn((s) => Math.max(s - 1, 0)), 1000);

    return () => clearInterval(id);
  }, [resendIn]);

  async function onEmailSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsSending(true);
    try {
      const resp = await forgotPassword(values.email);
      setEmail(values.email);
      setOtp("");
      setResendIn(OTP_RESEND_SECONDS);
      setStep("otp");
      toast.success(resp.message, { title: t("auth.forgotPassword.codeSentToast.title") });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("auth.forgotPassword.sendFailed")), {
        title: t("auth.forgotPassword.sendFailedTitle"),
      });
    } finally {
      setIsSending(false);
    }
  }

  async function onVerify(code: string) {
    if (!/^\d{4,6}$/.test(code)) {
      setOtpError(t("auth.forgotPassword.enterCodeError"));

      return;
    }

    setOtpError(null);
    setIsVerifying(true);
    try {
      await verifyResetOtp(email, code);
      setStep("password");
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("auth.forgotPassword.invalidCode")), {
        title: t("auth.forgotPassword.verificationFailed"),
      });
    } finally {
      setIsVerifying(false);
    }
  }

  async function resendOtp() {
    if (resendIn > 0) {
      return;
    }

    setIsVerifying(true);
    try {
      await forgotPassword(email);
      setResendIn(OTP_RESEND_SECONDS);
      toast.success(t("auth.forgotPassword.codeResent", { email }), {
        title: t("auth.forgotPassword.codeResentTitle"),
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("auth.forgotPassword.sendFailed")), {
        title: t("auth.forgotPassword.sendFailedTitle"),
      });
    } finally {
      setIsVerifying(false);
    }
  }

  async function onResetSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setIsResetting(true);
    try {
      await resetPassword(email, otp, values.newPassword);
      toast.success(t("auth.forgotPassword.reset.successToast.body"), {
        title: t("auth.forgotPassword.reset.successToast.title"),
      });
      navigate("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("auth.forgotPassword.resetFailed")), {
        title: t("auth.forgotPassword.resetFailedTitle"),
      });
    } finally {
      setIsResetting(false);
    }
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBanner />
        <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-300 px-4">
          <div className="w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-primary">
              {t("auth.forgotPassword.codeVerificationTitle")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t("auth.forgotPassword.codeSentTo")}{" "}
              <span className="font-medium text-primary">{email}</span> ·{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setStep("email")}
              >
                {t("auth.forgotPassword.changeEmail")}
              </button>
            </p>

            <OtpInput
              value={otp}
              onChange={(v) => {
                setOtp(v);
                setOtpError(null);
              }}
              onComplete={onVerify}
              disabled={isVerifying}
            />
            {otpError && <p className="text-sm text-red-500 mt-2">{otpError}</p>}

            <Button
              type="button"
              className="w-full mt-6"
              onClick={() => onVerify(otp)}
              disabled={isVerifying}
            >
              {isVerifying
                ? t("auth.forgotPassword.verifying")
                : t("auth.forgotPassword.verifyButton")}
            </Button>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t("auth.forgotPassword.didntReceive")}{" "}
              {resendIn > 0 ? (
                <span className="text-gray-400">
                  {t("auth.forgotPassword.resendIn", { seconds: resendIn })}
                </span>
              ) : (
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={resendOtp}
                  disabled={isVerifying}
                >
                  {t("auth.forgotPassword.resendButton")}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBanner />
        <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-300 px-4">
          <div className="w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                {t("auth.forgotPassword.reset.title")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("auth.forgotPassword.reset.formSubtitle")}
              </p>
            </div>

            <DynamicForm
              schema={resetPasswordSchema}
              fields={resetPasswordFields}
              defaultValues={{ newPassword: "", confirmPassword: "" }}
              onSubmit={onResetSubmit}
              submitText={t("auth.forgotPassword.reset.submit")}
              isSubmitting={isResetting}
              submittingText={t("auth.forgotPassword.reset.resetting")}
            />

            <div className="mt-4 text-sm text-center">
              <Link to="/login" className="text-primary-light hover:underline">
                {t("auth.forgotPassword.backToLogin")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
            onSubmit={onEmailSubmit}
            submitText={t("auth.forgotPassword.submit")}
            isSubmitting={isSending}
            submittingText={t("auth.forgotPassword.sending")}
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
