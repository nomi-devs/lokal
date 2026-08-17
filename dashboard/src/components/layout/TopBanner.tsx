// TopBanner.tsx
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function TopBanner() {
  return (
    <div className="w-full h-10 flex items-center justify-end px-4 bg-primary text-white dark:bg-secondary transition-colors duration-300">
      <ThemeToggle />
    </div>
  );
}
