import { z } from "zod";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { registerVendor, resendVendorOtp, uploadKycDocument, verifyVendorRegistration } from "@/lib/vendorsApi";
import { getApiErrorMessage } from "@/lib/apiClient";
import TopBanner from "@/components/layout/TopBanner";
import DynamicForm from "@/components/form/DynamicForm";
import type { FieldConfig } from "@/components/form/DynamicForm";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/OtpInput";
import { toast } from "@/components/ui/Toast";

const OTP_RESEND_SECONDS = 30;

// Vendor sign-up — the only real self-registration flow the dashboard has
// (admins are seed-only, customers register via OTP on the mobile app).
// Three steps, three endpoints: (1) fill in the full form → POST
// /vendors/register emails an OTP and creates nothing yet; (2) verify it →
// POST /vendors/verify-registration (same payload + otp) actually creates
// the account; a mistyped/expired code can be re-sent via
// POST /vendors/resend-otp. (3) the account is shown as pending KYC review.
const registerSchema = z
  .object({
    phone: z.string().regex(/^\+[1-9]\d{6,14}$/, "Phone must be in E.164 format, e.g. +96500000000"),
    firstName: z.string().min(2, "Too short"),
    lastName: z.string().min(2, "Too short"),
    email: z.email("Invalid email"),
    storeName: z.string().min(2, "Too short"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState<{ storeName: string; message: string } | null>(null);

  // Set once the full form is submitted and the OTP has been sent — holds
  // everything needed to actually create the account once the code is verified.
  const [pending, setPending] = useState<{ values: RegisterValues; kycDocumentUrl: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) {return;}

    const id = setInterval(() => setResendIn((s) => Math.max(s - 1, 0)), 1000);

    return () => clearInterval(id);
  }, [resendIn]);

  const registerFields: FieldConfig[] = [
    { name: "storeName", label: t("auth.register.storeNameLabel"), type: "text", placeholder: t("auth.register.storeNamePlaceholder"), col: 12 },
    { name: "firstName", label: t("auth.register.firstNameLabel"), type: "text", placeholder: t("auth.register.firstNamePlaceholder"), col: 6 },
    { name: "lastName", label: t("auth.register.lastNameLabel"), type: "text", placeholder: t("auth.register.lastNamePlaceholder"), col: 6 },
    { name: "phone", label: t("auth.register.phoneLabel"), type: "phone", col: 6 },
    { name: "email", label: t("auth.register.emailLabel"), type: "email", placeholder: "you@example.com", col: 6 },
    {
      name: "password",
      label: t("auth.register.passwordLabel"),
      type: "password",
      placeholder: "••••••••",
      autocomplete: "new-password",
      col: 6,
    },
    {
      name: "confirmPassword",
      label: t("auth.register.confirmPasswordLabel"),
      type: "password",
      placeholder: "••••••••",
      autocomplete: "new-password",
      col: 6,
    },
    { name: "kycDocument", label: t("auth.register.kycDocumentLabel"), type: "file", col: 12 },
  ];

  // Step 1 → 2: upload the KYC doc, submit the full form (without `otp`) to
  // have the code emailed, then move to the verify screen.
  async function onSubmit(values: RegisterValues) {
    if (!kycFile) {
      toast.error(t("auth.register.kycRequired"), {
        title: t("auth.register.kycRequiredTitle"),
      });

      return;
    }

    setIsSubmitting(true);
    try {
      let kycDocumentUrl: string;
      try {
        kycDocumentUrl = await uploadKycDocument(kycFile);
      } catch {
        // This PUT goes straight to S3, not through our backend, so
        // getApiErrorMessage's error envelope parsing doesn't apply — most
        // often a blocked CORS preflight on the bucket, which surfaces to
        // axios as a bare network error with no response body.
        toast.error(t("auth.register.uploadFailed"), { title: t("auth.register.uploadFailedTitle") });

        return;
      }

      await registerVendor({
        phone: values.phone,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        storeName: values.storeName,
        kycDocumentUrl,
      });

      setPending({ values, kycDocumentUrl });
      setOtp("");
      setResendIn(OTP_RESEND_SECONDS);
      toast.success(t("auth.register.codeSentSuccess", { email: values.email }), { title: t("auth.register.checkInboxTitle") });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("auth.register.sendFailed")), { title: t("auth.register.sendFailedTitle") });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 2 → 3: resubmit the same payload with `otp` filled in to verify and
  // actually create the account.
  async function onVerify(code: string) {
    if (!pending) {return;}

    if (!/^\d{4,6}$/.test(code)) {
      setOtpError(t("auth.register.enterCodeError"));

      return;
    }

    setOtpError(null);
    setVerifying(true);
    try {
      const { values, kycDocumentUrl } = pending;

      const resp = await verifyVendorRegistration({
        phone: values.phone,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        otp: code,
        password: values.password,
        storeName: values.storeName,
        kycDocumentUrl,
      });

      setRegistered({ storeName: resp.vendor.storeName, message: resp.vendor.message });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("auth.register.verificationFailed")), { title: t("auth.register.verificationFailed") });
    } finally {
      setVerifying(false);
    }
  }

  async function resendOtp() {
    if (!pending || resendIn > 0) {return;}

    setVerifying(true);
    try {
      await resendVendorOtp(pending.values.email);
      setResendIn(OTP_RESEND_SECONDS);
      toast.success(t("auth.register.codeResent", { email: pending.values.email }), { title: t("auth.register.codeResentTitle") });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("auth.register.sendFailed")), { title: t("auth.register.sendFailedTitle") });
    } finally {
      setVerifying(false);
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBanner />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-4 py-8">
          <div className="w-full max-w-xl p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-500" />
            <h1 className="text-2xl font-bold mb-2 text-primary dark:text-white">{t("auth.register.registeredTitle")}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-1">
              <span className="font-medium">{registered.storeName}</span> {t("auth.register.registeredPending")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{registered.message}</p>
            <Link
              to="/login"
              className="inline-block rounded-md bg-primary px-6 py-2 text-white hover:opacity-90 transition-opacity"
            >
              {t("auth.register.goToLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBanner />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-4 py-8">
          <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-primary dark:text-white">{t("auth.register.otpTitle")}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t("auth.register.otpSubtitle")} <span className="font-medium text-primary">{pending.values.email}</span>{" "}
              ·{" "}
              <button type="button" className="text-primary hover:underline" onClick={() => setPending(null)}>
                {t("auth.register.changeEmail")}
              </button>
            </p>

            <OtpInput
              value={otp}
              onChange={(v) => {
                setOtp(v);
                setOtpError(null);
              }}
              onComplete={onVerify}
              disabled={verifying}
            />
            {otpError && <p className="text-sm text-red-500 mt-2">{otpError}</p>}

            <Button type="button" className="w-full mt-6" onClick={() => onVerify(otp)} disabled={verifying}>
              {verifying ? t("auth.register.verifying") : t("auth.register.verifyButton")}
            </Button>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t("auth.register.didntReceive")}{" "}
              {resendIn > 0 ? (
                <span className="text-gray-400">{t("auth.register.resendIn", { seconds: resendIn })}</span>
              ) : (
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={resendOtp}
                  disabled={verifying}
                >
                  {t("auth.register.resendButton")}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-4 py-8">
        <div className="w-full max-w-xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-1 text-primary dark:text-white">{t("auth.register.pageTitle")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t("auth.register.pageSubtitle")}
          </p>

          <DynamicForm
            schema={registerSchema}
            fields={registerFields}
            defaultValues={{
              storeName: "",
              firstName: "",
              lastName: "",
              phone: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            onSubmit={onSubmit}
            submitText={t("auth.register.submitText")}
            isSubmitting={isSubmitting}
            submittingText={t("auth.register.submittingText")}
            onChange={(name, value) => {
              if (name === "kycDocument") {
                setKycFile((value as File | undefined) ?? null);
              }
            }}
          />

          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between text-sm text-center sm:text-left">
            <Link to="/login" className="text-blue-500 hover:underline dark:text-blue-400">
              {t("auth.register.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
