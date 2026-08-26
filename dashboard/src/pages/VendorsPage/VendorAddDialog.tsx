import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Store } from "lucide-react";

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
import { uploadKycDocument } from "@/lib/vendorsApi";
import * as adminApi from "@/lib/adminApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const schema = z.object({
  storeName: z.string().min(2, "Too short"),
  firstName: z.string().min(2, "Too short"),
  lastName: z.string().min(2, "Too short"),
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/, "Phone must be in E.164 format, e.g. +96500000000"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeDescription: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["pending_approval", "active"]),
});

export default function VendorAddDialog({ open, onOpenChange, onCreated }: Props) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycFile, setKycFile] = useState<File | null>(null);

  const fields: FieldConfig[] = [
    {
      name: "storeName",
      label: t("vendors.addDialog.storeName"),
      type: "text",
      placeholder: t("vendors.addDialog.storeNamePlaceholder"),
      col: 12,
    },
    {
      name: "firstName",
      label: t("vendors.addDialog.firstName"),
      type: "text",
      placeholder: t("vendors.addDialog.firstNamePlaceholder"),
      col: 6,
    },
    {
      name: "lastName",
      label: t("vendors.addDialog.lastName"),
      type: "text",
      placeholder: t("vendors.addDialog.lastNamePlaceholder"),
      col: 6,
    },
    { name: "phone", label: t("vendors.addDialog.phone"), type: "phone", col: 6 },
    {
      name: "email",
      label: t("vendors.addDialog.email"),
      type: "email",
      placeholder: t("vendors.addDialog.emailPlaceholder"),
      col: 6,
    },
    {
      name: "password",
      label: t("vendors.addDialog.password"),
      type: "password",
      placeholder: t("vendors.addDialog.passwordPlaceholder"),
      autocomplete: "new-password",
      col: 6,
    },
    {
      name: "status",
      label: t("vendors.addDialog.status"),
      type: "select",
      col: 6,
      options: [
        { label: t("vendors.addDialog.statusPending"), value: "pending_approval" },
        { label: t("vendors.addDialog.statusActive"), value: "active" },
      ],
    },
    { name: "city", label: t("vendors.addDialog.city"), type: "text", col: 6 },
    { name: "address", label: t("vendors.addDialog.address"), type: "text", col: 6 },
    {
      name: "storeDescription",
      label: t("vendors.addDialog.storeDescription"),
      type: "textarea",
      col: 12,
    },
    { name: "kycDocument", label: t("auth.register.kycDocumentLabel"), type: "file", col: 12 },
  ];

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsSubmitting(true);
    try {
      let kycDocumentUrl: string | undefined;

      if (kycFile) {
        try {
          kycDocumentUrl = await uploadKycDocument(kycFile);
        } catch {
          // Straight-to-S3 PUT, not through our backend — see Register page's
          // identical catch for why getApiErrorMessage doesn't apply here.
          toast.error(t("auth.register.uploadFailed"), {
            title: t("auth.register.uploadFailedTitle"),
          });

          return;
        }
      }

      await adminApi.createVendor({
        phone: values.phone,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        storeName: values.storeName,
        storeDescription: values.storeDescription || undefined,
        city: values.city || undefined,
        address: values.address || undefined,
        kycDocumentUrl,
        status: values.status,
      });
      toast.success(t("vendors.addDialog.createdSuccess"), {
        title: t("vendors.addDialog.createdTitle"),
      });
      onOpenChange(false);
      onCreated();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendors.addDialog.createFailed")), {
        title: t("vendors.addDialog.createFailedTitle"),
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
            <Store className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg">{t("vendors.addDialog.title")}</DialogTitle>
            <p className="text-sm text-muted-foreground">{t("vendors.addDialog.description")}</p>
          </div>
        </DialogHeader>

        <DialogBody>
          <DynamicForm
            schema={schema}
            fields={fields}
            defaultValues={{
              storeName: "",
              firstName: "",
              lastName: "",
              phone: "",
              email: "",
              password: "",
              storeDescription: "",
              city: "",
              address: "",
              status: "active",
            }}
            onSubmit={onSubmit}
            submitText={t("vendors.addDialog.submit")}
            isSubmitting={isSubmitting}
            submittingText={t("vendors.addDialog.submitting")}
            onChange={(name, value) => {
              if (name === "kycDocument") {
                setKycFile((value as File | undefined) ?? null);
              }
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
