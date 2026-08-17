// src/components/form/DynamicForm.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
// Zod generic inference cannot bridge to react-hook-form's FieldValues without `any` casts here.
import { useState } from "react";
import type { z } from "zod";
import type { ZodTypeAny } from "zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react"; // icons
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
  | "pdf";

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
}

/**
 * Helper type:
 * - If z.infer<Schema> resolves to an object type, use it.
 * - Otherwise fall back to a generic Record<string, any> so it satisfies FieldValues.
 */
type NormalizeZodInfer<T> = T extends Record<string, any> ? T : Record<string, any>;

export default function DynamicForm<Schema extends ZodTypeAny>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  submitText = "Submit",
  onChange, // ADDED: Destructure the new prop
}: DynamicFormProps<Schema>) {
  // Infer form value type and ensure it extends FieldValues
  type Inferred = NormalizeZodInfer<z.infer<Schema>>;

  // Create the form. We cast a bit to match UseFormReturn<FieldValues> expected by ShadCN Form wrapper.
  const form = useForm<Inferred>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
  });

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
          <Button type="submit" className="w-full">
            {submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
