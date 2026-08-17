import { Toaster } from "./Toast";

import { useDirection } from "@/providers/DirectionProvider";

export function DirectionAwareToaster() {
  const { direction } = useDirection();

  return <Toaster position={direction === "rtl" ? "top-left" : "top-right"} />;
}
