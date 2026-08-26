import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, XCircle, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogBody, DialogFooter } from "@/components/ui/dialog";
import DialogIconHeader from "@/components/ui/DialogIconHeader";
import { cn } from "@/lib/utils";

interface VendorTarget {
  id: string;
  storeName: string;
}

interface BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: VendorTarget | null;
}

export type VendorActionDialogProps = BaseProps &
  (
    | { action: "approve"; onConfirm: (vendorId: string, notes: string) => void }
    | { action: "reject"; onConfirm: (vendorId: string, reason: string, category: string) => void }
    | { action: "suspend"; onConfirm: (vendorId: string, reason: string, duration?: number) => void }
  );

const rejectSchema = z.object({
  rejectionCategory: z.string().min(1, "Select a category"),
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});
type RejectValues = z.infer<typeof rejectSchema>;

// Shared by /admin/vendors and /admin/kyc-verification. Approve, reject and
// suspend are all "confirm a decision about this vendor" dialogs that differ
// only in icon/color and which fields they collect — one component, switched
// on `action`, instead of three near-identical dialog files.
export default function VendorActionDialog(props: VendorActionDialogProps) {
  const { open, onOpenChange, vendor, action } = props;
  const { t } = useTranslation();

  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");

  const rejectionCategories = [
    { value: "expired", label: t("vendors.rejectModal.categories.expired") },
    { value: "invalid", label: t("vendors.rejectModal.categories.invalid") },
    { value: "incomplete", label: t("vendors.rejectModal.categories.incomplete") },
    { value: "fraud", label: t("vendors.rejectModal.categories.fraud") },
  ] as const;

  const {
    register,
    handleSubmit,
    reset: resetRejectForm,
    formState: { errors },
  } = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { rejectionCategory: "", rejectionReason: "" },
  });

  useEffect(() => {
    if (open) {
      setNotes("");
      setReason("");
      setDuration("");
      resetRejectForm({ rejectionCategory: "", rejectionReason: "" });
    }
  }, [open, vendor, resetRejectForm]);

  if (!vendor) {
    return null;
  }

  function submitReject(values: RejectValues) {
    if (props.action !== "reject") {
      return;
    }

    props.onConfirm(vendor!.id, values.rejectionReason, values.rejectionCategory);
    onOpenChange(false);
  }

  function handleConfirm() {
    if (props.action === "approve") {
      props.onConfirm(vendor!.id, notes);
    } else if (props.action === "suspend") {
      if (!reason.trim()) {
        return;
      }

      props.onConfirm(vendor!.id, reason, duration ? Number(duration) : undefined);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("p-0 max-w-md max-h-[70vh]", action === "approve" ? "min-h-[280px]" : "min-h-[320px]")}
      >
        {action === "approve" && (
          <DialogIconHeader
            icon={CheckCircle2}
            variant="success"
            title={t("vendors.approveModal.title")}
            description={t("vendors.approveModal.description", { storeName: vendor.storeName })}
          />
        )}
        {action === "reject" && (
          <DialogIconHeader
            icon={XCircle}
            title={t("vendors.rejectModal.title")}
            description={t("vendors.rejectModal.description", { storeName: vendor.storeName })}
          />
        )}
        {action === "suspend" && (
          <DialogIconHeader
            icon={ShieldOff}
            variant="warning"
            title={t("vendors.suspendModal.title")}
            description={t("vendors.suspendModal.description", { storeName: vendor.storeName })}
          />
        )}

        {action === "approve" && (
          <>
            <DialogBody>
              <Label className="mb-1.5 block">{t("vendors.approveModal.notesLabel")}</Label>
              <Textarea
                placeholder={t("vendors.approveModal.notesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                {t("vendors.approveModal.cancel")}
              </Button>
              <Button type="button" variant="success" onClick={handleConfirm}>
                <CheckCircle2 className="w-4 h-4" />
                {t("vendors.approveModal.approve")}
              </Button>
            </DialogFooter>
          </>
        )}

        {action === "reject" && (
          <form onSubmit={handleSubmit(submitReject)} className="contents">
            <DialogBody className="flex flex-col gap-4">
              <div>
                <Label className="mb-1.5 block">{t("vendors.rejectModal.categoryLabel")}</Label>
                <Select {...register("rejectionCategory")}>
                  <option value="">{t("vendors.rejectModal.selectReason")}</option>
                  {rejectionCategories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
                {errors.rejectionCategory && (
                  <p className="text-xs text-destructive mt-1">
                    {t("vendors.rejectModal.errors.categoryRequired")}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">
                  {t("vendors.rejectModal.detailsLabel")} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  placeholder={t("vendors.rejectModal.detailsPlaceholder")}
                  {...register("rejectionReason")}
                />
                {errors.rejectionReason && (
                  <p className="text-xs text-destructive mt-1">
                    {t("vendors.rejectModal.errors.reasonRequired")}
                  </p>
                )}
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                {t("vendors.rejectModal.cancel")}
              </Button>
              <Button type="submit" variant="destructive">
                <XCircle className="w-4 h-4" />
                {t("vendors.rejectModal.reject")}
              </Button>
            </DialogFooter>
          </form>
        )}

        {action === "suspend" && (
          <>
            <DialogBody className="flex flex-col gap-4">
              <div>
                <Label className="mb-1.5 block">
                  {t("vendors.suspendModal.reasonLabel")} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  className="min-h-20"
                  placeholder={t("vendors.suspendModal.reasonPlaceholder")}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">{t("vendors.suspendModal.durationLabel")}</Label>
                <Input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                {t("vendors.suspendModal.cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                disabled={!reason.trim()}
              >
                <ShieldOff className="w-4 h-4" />
                {t("vendors.suspendModal.suspend")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
