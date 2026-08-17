import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center text-center gap-6 max-w-md">
        {/* Big 404 */}
        <p className="text-[8rem] font-black leading-none text-foreground/10 select-none">404</p>

        <div className="flex flex-col gap-2 -mt-4">
          <h1 className="text-2xl font-bold">{t("notFound.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("notFound.description")}</p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t("notFound.backHome")}
        </Link>
      </div>
    </div>
  );
}
