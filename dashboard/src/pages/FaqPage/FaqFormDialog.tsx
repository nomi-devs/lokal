import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { HelpCircle, ListOrdered } from "lucide-react";

import type { AdminFaq } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const faqSchema = z.object({
  questionEn: z.string().min(1, "Question (English) is required"),
  questionAr: z.string().min(1, "Question (Arabic) is required"),
  answerEn: z.string().min(1, "Answer (English) is required"),
  answerAr: z.string().min(1, "Answer (Arabic) is required"),
  sortOrder: z.number().int().min(0),
});

export type FaqFormValues = z.infer<typeof faqSchema>;

const emptyValues: FaqFormValues = {
  questionEn: "",
  questionAr: "",
  answerEn: "",
  answerAr: "",
  sortOrder: 0,
};

const labelRowCls = "flex items-center gap-1.5 mb-1.5";

export interface FaqFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: AdminFaq | null;
  onSubmit: (values: FaqFormValues, editingId: string | null) => void;
}

export default function FaqFormDialog({ open, onOpenChange, faq, onSubmit }: FaqFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!faq;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      faq
        ? {
            questionEn: faq.questionEn,
            questionAr: faq.questionAr,
            answerEn: faq.answerEn,
            answerAr: faq.answerAr,
            sortOrder: faq.sortOrder,
          }
        : emptyValues
    );
  }, [open, faq, reset]);

  function submit(values: FaqFormValues) {
    onSubmit(values, faq?.id ?? null);

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 min-h-[420px] max-h-[85vh]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {isEdit ? t("faqs.dialog.editTitle") : t("faqs.dialog.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? t("faqs.dialog.editDescription") : t("faqs.dialog.addDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
            {/* Questions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  {t("faqs.dialog.questionEn")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder={t("faqs.dialog.questionEnPlaceholder")}
                  {...register("questionEn")}
                />
                {errors.questionEn && (
                  <p className="text-xs text-destructive mt-1">{errors.questionEn.message}</p>
                )}
              </div>
              <div>
                <Label className={labelRowCls}>
                  {t("faqs.dialog.questionAr")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  dir="rtl"
                  placeholder={t("faqs.dialog.questionArPlaceholder")}
                  {...register("questionAr")}
                />
                {errors.questionAr && (
                  <p className="text-xs text-destructive mt-1">{errors.questionAr.message}</p>
                )}
              </div>
            </div>

            {/* Answers */}
            <div>
              <Label className={labelRowCls}>
                {t("faqs.dialog.answerEn")} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder={t("faqs.dialog.answerEnPlaceholder")}
                {...register("answerEn")}
              />
              {errors.answerEn && (
                <p className="text-xs text-destructive mt-1">{errors.answerEn.message}</p>
              )}
            </div>

            <div>
              <Label className={labelRowCls}>
                {t("faqs.dialog.answerAr")} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                className="text-right"
                dir="rtl"
                placeholder={t("faqs.dialog.answerArPlaceholder")}
                {...register("answerAr")}
              />
              {errors.answerAr && (
                <p className="text-xs text-destructive mt-1">{errors.answerAr.message}</p>
              )}
            </div>

            {/* Sort order */}
            <div className="w-40">
              <Label className={labelRowCls}>
                <ListOrdered className="w-3.5 h-3.5 text-primary" />
                {t("faqs.dialog.sortOrder")}
              </Label>
              <Input type="number" min={0} {...register("sortOrder", { valueAsNumber: true })} />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("faqs.dialog.close")}
            </Button>
            <Button type="submit">{isEdit ? t("faqs.dialog.save") : t("faqs.dialog.add")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
