// src/pages/auth/Login.tsx
import { z } from "zod";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import type { AppDispatch, RootState } from "@/store";
import { store } from "@/store";
import { login } from "@/store/slices/authSlice";
import TopBanner from "@/components/layout/TopBanner";
import DynamicForm from "@/components/form/DynamicForm";
import type { FieldConfig } from "@/components/form/DynamicForm";
import { toast } from "@/components/ui/Toast";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

const loginFields: FieldConfig[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    autocomplete: "email",
    col: 12,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    autocomplete: "current-password",
    col: 12,
  },
];

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();

  function onSubmit(values: z.infer<typeof loginSchema>) {
    dispatch(login(values));
    const { error, isAuthenticated } = (store.getState() as RootState).auth;

    if (isAuthenticated) {
      toast.success("Welcome back!", { title: "Login Successful" });
    } else if (error) {
      toast.error(error, { title: "Login Failed" });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-300 px-4">
        <div className="w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Branding */}
          <div className="mb-6 text-center">
            <img src="/logo.svg" alt="Logo" className="mx-auto h-12 mb-2" />
            <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please sign in to continue</p>
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
            submitText="Login"
          />

          {/* Links */}
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between text-sm text-center sm:text-left">
            <Link to="/forgot-password" className="text-primary-light hover:underline">
              Forgot Password?
            </Link>
            <span className="mt-2 sm:mt-0">
              Don't have an account?{" "}
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
