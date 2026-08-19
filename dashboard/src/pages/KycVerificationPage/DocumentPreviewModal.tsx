import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Download, FileText } from "lucide-react";

import type { KycDocument } from "@/data/vendors";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: KycDocument | null;
  documentLabel: string;
}

export default function DocumentPreviewModal({
  open,
  onOpenChange,
  document: doc,
  documentLabel,
}: Props) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [doc]);

  if (!doc) {
    return null;
  }

  const isPdf = doc.url.toLowerCase().endsWith(".pdf");
  const showPlaceholder = isPdf || imageFailed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-3xl h-[85vh] flex flex-col gap-0" showClose={false}>
        <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label={t("kyc.preview.back")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base">{documentLabel}</DialogTitle>
            <DialogDescription className="sr-only">{t("kyc.preview.title")}</DialogDescription>
          </div>
          <a href={doc.url} download>
            <Button type="button" variant="outline" size="sm">
              <Download className="w-3.5 h-3.5" />
              {t("kyc.preview.download")}
            </Button>
          </a>
        </div>

        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-6">
          {showPlaceholder ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="w-12 h-12" />
              <p className="text-sm font-medium">{documentLabel}</p>
            </div>
          ) : (
            <img
              src={doc.url}
              alt={documentLabel}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
