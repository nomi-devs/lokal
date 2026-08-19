import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Store,
  User,
  Mail,
  Phone,
  Tag,
  IdCard,
  Receipt,
  Briefcase,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
} from "lucide-react";

import DocumentPreviewModal from "./DocumentPreviewModal";

import type { Vendor, KycDocument, KycDocumentType } from "@/data/vendors";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const avatarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-teal-500",
];
const avatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const documentIcons: Record<KycDocumentType, typeof IdCard> = {
  id: IdCard,
  tax: Receipt,
  business_license: Briefcase,
};

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-sm font-semibold">{value || "—"}</span>
    </div>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export default function KycDetailsDialog({ open, onOpenChange, vendor }: Props) {
  const { t } = useTranslation();
  const [previewDoc, setPreviewDoc] = useState<KycDocument | null>(null);
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  if (!vendor) {
    return null;
  }

  const initials = vendor.nameEn
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const isActive = vendor.status === "approved";

  const submittedAt = new Date(vendor.kyc.submittedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 max-w-4xl h-[85vh] flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-5 border-b shrink-0">
            {vendor.logoUrl ? (
              <img
                src={vendor.logoUrl}
                alt={vendor.nameEn}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div
                className={cn(
                  "w-14 h-14 rounded-lg flex items-center justify-center text-lg font-bold text-white shrink-0",
                  avatarColor(vendor.nameEn)
                )}
              >
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-bold">{vendor.nameEn}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {t("kyc.details.description")}
              </DialogDescription>
            </div>
          </div>

          {/* Two-column body */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left — vendor info */}
            <div className="p-6 border-b md:border-b-0 md:border-r flex flex-col gap-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Store className="w-4 h-4 text-primary" />
                {t("kyc.details.basicInfo")}
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <InfoField
                  icon={User}
                  label={t("vendors.dialog.ownerName")}
                  value={vendor.ownerName}
                />
                <InfoField icon={Mail} label={t("vendors.dialog.email")} value={vendor.email} />
                <InfoField icon={Phone} label={t("vendors.dialog.phone")} value={vendor.phone} />
                <InfoField
                  icon={Tag}
                  label={t("kyc.details.storeCategory")}
                  value={vendor.category}
                />
                <InfoField
                  icon={isActive ? CheckCircle2 : Clock}
                  label={t("kyc.details.accountStatus")}
                  value={
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                        isActive
                          ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30"
                          : "text-muted-foreground bg-muted"
                      )}
                    >
                      {isActive ? t("common.status.active") : t("common.status.inactive")}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Right — KYC documents */}
            <div className="p-6 flex flex-col gap-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="w-4 h-4 text-primary" />
                {t("kyc.details.documents")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {vendor.kyc.documents.map((doc) => {
                  const Icon = documentIcons[doc.type];
                  const verified = !!doc.verifiedAt;

                  return (
                    <div key={doc.type} className="rounded-lg border p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </span>
                        {verified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm font-semibold leading-tight">
                        {t(`kyc.documentTypes.${doc.type}`)}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          verified
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {verified
                          ? t("kyc.documentStatus.verified")
                          : t("kyc.documentStatus.pending")}
                      </p>
                      <p className="text-xs text-muted-foreground">{submittedAt}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {t("kyc.details.viewDocument")}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {vendor.documents.length > 0 && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllDocuments((v) => !v)}
                    className="text-sm font-medium text-primary hover:underline self-start"
                  >
                    {t("kyc.details.viewAllDocuments")}
                  </button>

                  {showAllDocuments && (
                    <div className="rounded-lg border divide-y">
                      {vendor.documents.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                        >
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{d.type}</span>
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {d.uploadedAt}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DocumentPreviewModal
        open={!!previewDoc}
        onOpenChange={(o) => {
          if (!o) {
            setPreviewDoc(null);
          }
        }}
        document={previewDoc}
        documentLabel={previewDoc ? t(`kyc.documentTypes.${previewDoc.type}`) : ""}
      />
    </>
  );
}
