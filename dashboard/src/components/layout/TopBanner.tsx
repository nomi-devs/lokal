// TopBanner.tsx
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default function TopBanner() {
  return (
    <div className="w-full h-10 flex items-center justify-end gap-2 px-4 bg-primary text-white dark:bg-secondary transition-colors duration-300">
      <ThemeToggle />
      <LanguageToggle />
    </div>
  );
}
