// src/components/form/DynamicForm.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
// Zod generic inference cannot bridge to react-hook-form's FieldValues without `any` casts here.
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import type { ZodTypeAny } from "zod";
import { useForm } from "react-hook-form";
import { ChevronDown, Eye, EyeOff } from "lucide-react"; // icons
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

/**
 * Field types supported
 */
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "file"
  | "select"
  | "textarea"
  | "pdf"
  | "phone";

// Dial-code choices for the "phone" field type's country dropdown.
export const PHONE_COUNTRIES = [
  { code: "KW", dialCode: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "SA", dialCode: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
] as const;

/**
 * Single field config
 */
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  autocomplete?: string;
  options?: { label: string; value: string }[]; // for select
  col?: 6 | 12; // layout width: 6 => half, 12 => full
}

/**
 * DynamicForm props
 *
 * Schema must be a Zod schema. We constrain and normalize the inferred type
 * to something that satisfies react-hook-form's FieldValues requirement.
 */
interface DynamicFormProps<Schema extends ZodTypeAny> {
  schema: Schema;
  fields: FieldConfig[];
  defaultValues?: Partial<z.infer<Schema>>;
  onSubmit: (values: z.infer<Schema>) => void;
  submitText?: string;
  onChange?: (name: string, value: any) => void; // ADDED: New optional onChange prop
  /** When this object changes (new reference), the form is reset to these values — e.g. a "fill demo credentials" action. */
  values?: Partial<z.infer<Schema>>;
  /** Disables the submit button and swaps its label — e.g. while an async onSubmit is in flight. */
  isSubmitting?: boolean;
  submittingText?: string;
}

/**
 * Helper type:
 * - If z.infer<Schema> resolves to an object type, use it.
 * - Otherwise fall back to a generic Record<string, any> so it satisfies FieldValues.
 */
type NormalizeZodInfer<T> = T extends Record<string, any> ? T : Record<string, any>;

// Splits a full E.164 value ("+96500000000") into the matching PHONE_COUNTRIES
// entry and the remaining local digits, defaulting to the first country when
// the value doesn't (yet) match one of the supported dial codes.
function splitPhoneValue(value: string) {
  const match = PHONE_COUNTRIES.find((c) => value.startsWith(c.dialCode));

  return match
    ? { country: match, local: value.slice(match.dialCode.length) }
    : { country: PHONE_COUNTRIES[0], local: value.replace(/^\+\d*/, "") };
}

function PhoneField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { country, local } = splitPhoneValue(value ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);

    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center rounded-full border bg-muted/40 dark:bg-gray-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 pl-4 pr-2 py-2.5 text-sm shrink-0"
      >
        <span>{country.flag}</span>
        <span>{country.dialCode}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>
      <div className="h-5 w-px bg-border" />
      <input
        type="tel"
        value={local}
        maxLength={8}
        placeholder={placeholder ?? "Enter phone number"}
        className="flex-1 bg-transparent border-0 outline-none px-3 py-2.5 text-sm placeholder:text-gray-400"
        onChange={(e) =>
          onChange(`${country.dialCode}${e.target.value.replace(/[^\d]/g, "").slice(0, 8)}`)
        }
      />
      {open && (
        <div className="absolute z-10 top-full mt-1 left-0 w-48 rounded-md border bg-white dark:bg-gray-800 shadow-lg py-1">
          {PHONE_COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              onClick={() => {
                onChange(`${c.dialCode}${local}`);
                setOpen(false);
              }}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
              <span className="ml-auto text-gray-400">{c.dialCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DynamicForm<Schema extends ZodTypeAny>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  submitText = "Submit",
  onChange, // ADDED: Destructure the new prop
  values,
  isSubmitting = false,
  submittingText,
}: DynamicFormProps<Schema>) {
  // Infer form value type and ensure it extends FieldValues
  type Inferred = NormalizeZodInfer<z.infer<Schema>>;

  // Create the form. We cast a bit to match UseFormReturn<FieldValues> expected by ShadCN Form wrapper.
  const form = useForm<Inferred>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
  });

  useEffect(() => {
    if (values) {
      form.reset(values as any);
    }
  }, [values]);

  // Cast so that the ShadCN Form component (which expects UseFormReturn<FieldValues>) accepts it.
  const formForProvider = form as unknown as UseFormReturn<FieldValues, any>;
  // State to manage password visibility
  const [passwordVisible, setPasswordVisible] = useState<{ [key: string]: boolean }>({});

  return (
    <Form {...(formForProvider as UseFormReturn<any>)}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="grid grid-cols-12 gap-4">
        {fields.map((field) => (
          <div key={field.name} className={cn(field.col === 6 ? "col-span-6" : "col-span-12")}>
            <FormField
              control={form.control as any}
              name={field.name as any}
              render={({ field: controller }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.type === "select" ? (
                      <select
                        {...controller}
                        className="border rounded-md p-2 w-full dark:bg-gray-800"
                        onChange={(e) => {
                          controller.onChange(e); // Let react-hook-form handle the change
                          onChange?.(field.name, e.target.value); // Call your custom onChange prop
                        }}
                      >
                        <option value="">Select</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        {...(controller as any)}
                        placeholder={field.placeholder}
                        className="border rounded-md p-2 w-full dark:bg-gray-800"
                        onChange={(e) => {
                          controller.onChange(e);
                          onChange?.(field.name, e.target.value);
                        }}
                      />
                    ) : field.type === "phone" ? (
                      <PhoneField
                        value={controller.value ?? ""}
                        placeholder={field.placeholder}
                        onChange={(value) => {
                          controller.onChange(value);
                          onChange?.(field.name, value);
                        }}
                      />
                    ) : field.type === "file" ? (
                      <input
                        {...(controller as any)}
                        type="file"
                        className="w-full"
                        onChange={(e) => {
                          controller.onChange(e);
                          onChange?.(field.name, e.target.files?.[0]);
                        }}
                      />
                    ) : field.type === "password" ? (
                      <div className="relative">
                        <Input
                          {...(controller as any)}
                          type={passwordVisible[field.name] ? "text" : "password"}
                          placeholder={field.placeholder}
                          autoComplete={field.autocomplete}
                          onChange={(e) => {
                            controller.onChange(e);
                            onChange?.(field.name, e.target.value);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPasswordVisible((prev) => ({
                              ...prev,
                              [field.name]: !prev[field.name],
                            }))
                          }
                          className="cursor-pointer absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          tabIndex={-1}
                        >
                          {passwordVisible[field.name] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <Input
                        {...(controller as any)}
                        type={field.type}
                        placeholder={field.placeholder}
                        autoComplete={field.autocomplete}
                        onChange={(e) => {
                          controller.onChange(e);
                          onChange?.(field.name, e.target.value);
                        }}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <div className="col-span-12">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (submittingText ?? submitText) : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
