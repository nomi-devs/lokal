import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  ShoppingCart,
  User,
  Banknote,
  Wallet,
  Landmark,
  Hash,
  Activity,
} from "lucide-react";

import type { Payment } from "@/data/payments";
import { orders } from "@/data/orders";
import { users } from "@/data/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const paymentSchema = z.object({
  orderId: z.string().min(1, "Order is required"),
  userId: z.string().min(1, "Customer is required"),
  amount: z.number().min(0, "Amount must be positive"),
  currency: z.enum(["KWD", "SAR"]),
  method: z.enum(["knet", "credit_card", "debit_card"]),
  gateway: z.enum(["myfatoorah", "tap"]),
  transactionId: z.string().min(1, "Transaction ID is required"),
  status: z.enum(["pending", "success", "failed"]),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

const emptyValues: PaymentFormValues = {
  orderId: "",
  userId: "",
  amount: 0,
  currency: "KWD",
  method: "knet",
  gateway: "myfatoorah",
  transactionId: "",
  status: "pending",
};

const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";

const selectCls = cn(
  "h-10 w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
);

export interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a payment to edit it; omit/null to add a new one. Same dialog handles both. */
  payment?: Payment | null;
  onSubmit: (values: PaymentFormValues, editingId: number | null) => void;
}

export default function PaymentFormDialog({
  open,
  onOpenChange,
  payment,
  onSubmit,
}: PaymentFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!payment;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: emptyValues,
  });

  // Re-seed the form whenever a different payment is opened for edit (or the dialog reopens in add mode).
  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      payment
        ? {
            orderId: String(payment.orderId),
            userId: String(payment.userId),
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            gateway: payment.gateway,
            transactionId: payment.transactionId,
            status: payment.status,
          }
        : emptyValues
    );
  }, [open, payment, reset]);

  function submit(values: PaymentFormValues) {
    onSubmit(values, payment?.id ?? null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {isEdit ? t("payments.dialog.editTitle") : t("payments.dialog.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t("payments.dialog.editDescription", { transactionId: payment!.transactionId })
                : t("payments.dialog.addDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
            {/* Order + Customer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                  {t("payments.dialog.order")} <span className="text-destructive">*</span>
                </Label>
                <select className={selectCls} {...register("orderId")}>
                  <option value="">{t("payments.dialog.selectOrder")}</option>
                  {orders.map((o) => (
                    <option key={o.id} value={String(o.id)}>
                      {o.orderNumber}
                    </option>
                  ))}
                </select>
                {errors.orderId && (
                  <p className="text-xs text-destructive mt-1">{errors.orderId.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <User className="w-3.5 h-3.5 text-primary" />
                  {t("payments.dialog.customer")} <span className="text-destructive">*</span>
                </Label>
                <select className={selectCls} {...register("userId")}>
                  <option value="">{t("payments.dialog.selectCustomer")}</option>
                  {users.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {`${u.firstName} ${u.lastName}`.trim()}
                    </option>
                  ))}
                </select>
                {errors.userId && (
                  <p className="text-xs text-destructive mt-1">{errors.userId.message}</p>
                )}
              </div>
            </div>

            {/* Amount + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Banknote className="w-3.5 h-3.5 text-primary" />
                  {t("payments.dialog.amount")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>{t("payments.dialog.currency")}</Label>
                <select className={selectCls} {...register("currency")}>
                  <option value="KWD">{t("payments.currency.kwd")}</option>
                  <option value="SAR">{t("payments.currency.sar")}</option>
                </select>
              </div>
            </div>

            {/* Method + Gateway */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  {t("payments.dialog.method")}
                </Label>
                <select className={selectCls} {...register("method")}>
                  <option value="knet">{t("payments.method.knet")}</option>
                  <option value="credit_card">{t("payments.method.credit_card")}</option>
                  <option value="debit_card">{t("payments.method.debit_card")}</option>
                </select>
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Landmark className="w-3.5 h-3.5 text-primary" />
                  {t("payments.dialog.gateway")}
                </Label>
                <select className={selectCls} {...register("gateway")}>
                  <option value="myfatoorah">{t("payments.gateway.myfatoorah")}</option>
                  <option value="tap">{t("payments.gateway.tap")}</option>
                </select>
              </div>
            </div>

            {/* Transaction ID */}
            <div>
              <Label className={labelRowCls}>
                <Hash className="w-3.5 h-3.5 text-primary" />
                {t("payments.dialog.transactionId")} <span className="text-destructive">*</span>
              </Label>
              <Input
                className={inputCls}
                placeholder={t("payments.dialog.transactionIdPlaceholder")}
                {...register("transactionId")}
              />
              {errors.transactionId && (
                <p className="text-xs text-destructive mt-1">{errors.transactionId.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <Label className={labelRowCls}>
                <Activity className="w-3.5 h-3.5 text-primary" />
                {t("payments.dialog.status")}
              </Label>
              <select className={selectCls} {...register("status")}>
                <option value="pending">{t("common.status.pending")}</option>
                <option value="success">{t("common.status.success")}</option>
                <option value="failed">{t("common.status.failed")}</option>
              </select>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("payments.dialog.close")}
            </Button>
            <Button type="submit">
              {isEdit ? t("payments.dialog.save") : t("payments.dialog.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
