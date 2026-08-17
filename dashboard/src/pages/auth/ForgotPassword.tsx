// src/pages/auth/ForgotPassword.tsx
import { z } from "zod";
import { Link } from "react-router-dom";

import TopBanner from "@/components/layout/TopBanner";
import DynamicForm from "@/components/form/DynamicForm";
import type { FieldConfig } from "@/components/form/DynamicForm";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

const forgotPasswordFields: FieldConfig[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    autocomplete: "email",
    col: 12,
  },
];

export default function ForgotPasswordPage() {
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
            <img src="/logo.svg" alt="Logo" className="mx-auto h-12 mb-2" />
            <h1 className="text-2xl font-bold text-primary">Forgot Password</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {/* Form */}
          <DynamicForm
            schema={forgotPasswordSchema}
            fields={forgotPasswordFields}
            defaultValues={{ email: "" }}
            onSubmit={onSubmit}
            submitText="Send Reset Link"
          />

          {/* Links */}
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between text-sm text-center sm:text-left">
            <Link to="/login" className="text-primary-light hover:underline">
              Back to Login
            </Link>
            <span className="mt-2 sm:mt-0">
              Don’t have an account?{" "}
              <Link to="/register" className="text-primary-light hover:underline">
                Register
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
