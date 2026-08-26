import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { UserPlus } from "lucide-react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DynamicForm from "@/components/form/DynamicForm";
import type { FieldConfig } from "@/components/form/DynamicForm";
import { toast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/lib/apiClient";
import * as adminApi from "@/lib/adminApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

// Password only applies to role "admin" — customer is the mobile-app,
// OTP-only role with no password login anywhere (see MobileAuthService).
const schema = z
  .object({
    firstName: z.string().min(2, "Too short"),
    lastName: z.string().min(2, "Too short"),
    phone: z
      .string()
      .regex(/^\+[1-9]\d{6,14}$/, "Phone must be in E.164 format, e.g. +96500000000"),
    email: z.union([z.email("Invalid email"), z.literal("")]).optional(),
    password: z.string().optional(),
    role: z.enum(["customer", "admin"]),
    status: z.enum(["active", "inactive"]),
  })
  .refine((data) => data.role !== "admin" || (data.password?.length ?? 0) >= 8, {
    message: "Password must be at least 8 characters",
    path: ["password"],
  });

export default function UserAddDialog({ open, onOpenChange, onCreated }: Props) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState("customer");

  const baseFields: FieldConfig[] = [
    {
      name: "firstName",
      label: t("users.addDialog.firstName"),
      type: "text",
      placeholder: t("users.addDialog.firstNamePlaceholder"),
      col: 6,
    },
    {
      name: "lastName",
      label: t("users.addDialog.lastName"),
      type: "text",
      placeholder: t("users.addDialog.lastNamePlaceholder"),
      col: 6,
    },
    { name: "phone", label: t("users.addDialog.phone"), type: "phone", col: 6 },
    {
      name: "email",
      label: t("users.addDialog.email"),
      type: "email",
      placeholder: t("users.addDialog.emailPlaceholder"),
      col: 6,
    },
    {
      name: "role",
      label: t("users.addDialog.role"),
      type: "select",
      col: 6,
      options: [
        { label: t("users.addDialog.roleCustomer"), value: "customer" },
        { label: t("users.addDialog.roleAdmin"), value: "admin" },
      ],
    },
    {
      name: "status",
      label: t("users.addDialog.status"),
      type: "select",
      col: 6,
      options: [
        { label: t("users.addDialog.statusActive"), value: "active" },
        { label: t("users.addDialog.statusInactive"), value: "inactive" },
      ],
    },
  ];

  const passwordField: FieldConfig = {
    name: "password",
    label: t("users.addDialog.password"),
    type: "password",
    placeholder: t("users.addDialog.passwordPlaceholder"),
    autocomplete: "new-password",
    col: 12,
  };

  const fields = role === "admin" ? [...baseFields, passwordField] : baseFields;

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsSubmitting(true);
    try {
      await adminApi.createUser({
        phone: values.phone,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || undefined,
        password: values.role === "admin" ? values.password : undefined,
        role: values.role,
        status: values.status,
      });
      toast.success(
        t("users.addDialog.createdSuccess", { name: `${values.firstName} ${values.lastName}` }),
        { title: t("users.addDialog.createdTitle") }
      );
      onOpenChange(false);
      onCreated();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("users.addDialog.createFailed")), {
        title: t("users.addDialog.createFailedTitle"),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl min-h-[420px] max-h-[85vh]">
        <DialogHeader>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg">{t("users.addDialog.title")}</DialogTitle>
            <p className="text-sm text-muted-foreground">{t("users.addDialog.description")}</p>
          </div>
        </DialogHeader>

        <DialogBody>
          <DynamicForm
            schema={schema}
            fields={fields}
            defaultValues={{
              firstName: "",
              lastName: "",
              phone: "",
              email: "",
              password: "",
              role: "customer",
              status: "active",
            }}
            onSubmit={onSubmit}
            submitText={t("users.addDialog.submit")}
            isSubmitting={isSubmitting}
            submittingText={t("users.addDialog.submitting")}
            onChange={(name, value) => {
              if (name === "role") {
                setRole(value as string);
              }
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
