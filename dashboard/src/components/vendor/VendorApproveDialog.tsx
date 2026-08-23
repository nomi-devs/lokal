import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-24 resize-y"
);

// Shared by /admin/vendors and /admin/kyc-verification — both approve through
// the same PUT /admin/vendors/:id/approve endpoint.
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: { id: string; storeName: string } | null;
  onApprove: (vendorId: string, notes: string) => void;
}

export default function VendorApproveDialog({ open, onOpenChange, vendor, onApprove }: Props) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {setNotes("");}
  }, [open, vendor]);

  if (!vendor) {return null;}

  function submit() {
    onApprove(vendor!.id, notes);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <DialogTitle>Approve vendor</DialogTitle>
            <DialogDescription>{vendor.storeName} will be able to log in and start selling.</DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody>
          <Label className="mb-1.5 block">Notes (optional)</Label>
          <textarea
            className={textareaCls}
            placeholder="Documents verified and correct"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} className="bg-emerald-600 text-white hover:bg-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
