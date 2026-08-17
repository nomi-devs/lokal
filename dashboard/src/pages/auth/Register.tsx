import { z } from "zod";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";

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

const registerFields: FieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    placeholder: "John Doe",
    autocomplete: "name",
    col: 12,
  },
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
    autocomplete: "new-password",
    col: 12,
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "••••••••",
    autocomplete: "new-password",
    col: 12,
  },
];

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function onSubmit(values: z.infer<typeof registerSchema>) {
    console.log("Register attempt:", values);
    dispatch(register(values));
  }

  function getStrength(pw: string) {
    if (!pw) {
      return { label: "", color: "" };
    }

    if (pw.length < 6) {
      return { label: "Weak", color: "bg-red-500" };
    }

    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[!@#$%^&*]/.test(pw)) {
      return { label: "Medium", color: "bg-yellow-500" };
    }

    return { label: "Strong", color: "bg-green-500" };
  }

  const strength = getStrength(password);
  const passwordsMatch = confirmPassword === password;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-3 text-primary dark:text-white">
            Create an Account
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
            submitText="Sign Up"
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
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          {/* Links Section */}
          <div className="mt-2 flex flex-col sm:flex-row sm:justify-between text-sm text-center sm:text-left">
            <Link to="/login" className="text-blue-500 hover:underline dark:text-blue-400">
              Back to Login
            </Link>
            <span className="mt-2 sm:mt-0">
              Forgot old one?{" "}
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:underline dark:text-blue-400"
              >
                Reset Password
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
