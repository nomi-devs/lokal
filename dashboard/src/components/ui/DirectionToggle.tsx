import { Button } from "@/components/ui/button";
import { useDirection } from "@/providers/DirectionProvider";

export function DirectionToggle() {
  const { direction, toggleDirection } = useDirection();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDirection}
      className="text-black dark:text-white cursor-pointer font-bold text-xs w-9 h-9"
      title={direction === "ltr" ? "Switch to RTL" : "Switch to LTR"}
    >
      {direction === "ltr" ? "RTL" : "LTR"}
    </Button>
  );
}
