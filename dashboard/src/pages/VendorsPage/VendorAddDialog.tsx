import { useState } from "react";
import { z } from "zod";
import { Store } from "lucide-react";

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const fields: FieldConfig[] = [
  { name: "storeName", label: "Store name", type: "text", placeholder: "Fashion Store", col: 12 },
  { name: "firstName", label: "Owner first name", type: "text", placeholder: "Ahmed", col: 6 },
  { name: "lastName", label: "Owner last name", type: "text", placeholder: "Al-Rashid", col: 6 },
  { name: "phone", label: "Phone", type: "phone", col: 6 },
  { name: "email", label: "Email", type: "email", placeholder: "you@example.com", col: 6 },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    autocomplete: "new-password",
    col: 6,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    col: 6,
    options: [
      { label: "Pending approval", value: "pending_approval" },
      { label: "Active", value: "active" },
    ],
  },
  { name: "city", label: "City (optional)", type: "text", col: 6 },
  { name: "address", label: "Address (optional)", type: "text", col: 6 },
  { name: "storeDescription", label: "Store description (optional)", type: "textarea", col: 12 },
  { name: "kycDocument", label: "KYC document — business license or ID (optional)", type: "file", col: 12 },
];

export default function VendorAddDialog({ open, onOpenChange, onCreated }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycFile, setKycFile] = useState<File | null>(null);

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
          toast.error("Couldn't upload the KYC document. Please try again.", { title: "Upload failed" });

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
      toast.success(`${values.storeName} was added.`, { title: "Vendor created" });
      onOpenChange(false);
      onCreated();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't create the vendor"), { title: "Create failed" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg">Add New Vendor</DialogTitle>
            <p className="text-sm text-muted-foreground">Fill in the store and owner details below</p>
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
            submitText="Add Vendor"
            isSubmitting={isSubmitting}
            submittingText="Adding…"
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
