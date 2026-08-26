import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, X } from "lucide-react";

import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/Toast";
import { uploadProductImage } from "@/lib/productsApi";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  addLabel: string;
  uploadingLabel: string;
  images: string[];
  onChange: (images: string[]) => void;
}

// Shared multi-image gallery field for the admin and vendor product dialogs —
// uploads straight to S3 via the presigned /files/upload-url flow (see
// productsApi.uploadProductImage) and appends the resulting URL.
export default function ProductImagesField({
  label,
  addLabel,
  uploadingLabel,
  images,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      onChange([...images, url]);
    } catch {
      toast.error("Couldn't upload the image. Please try again.", { title: "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <Label className="flex items-center gap-1.5 mb-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-primary" />
        {label} <span className="text-destructive">*</span>
      </Label>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div
            key={url}
            className="relative w-20 h-20 rounded-lg border overflow-hidden group shrink-0"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 end-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFiles}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-20 h-20 rounded-lg border border-dashed flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted/40 shrink-0 disabled:opacity-50"
          )}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          <span className="text-center leading-tight px-1">
            {uploading ? uploadingLabel : addLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
