import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, DetailSection, InitialsAvatar } from "@/components/ui/DetailView";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { getApiErrorMessage } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toast";
import * as adminApi from "@/lib/adminApi";
import type { AdminVendorRow } from "@/lib/adminApi";
import type { Product } from "@/lib/productsApi";
import { cn } from "@/lib/utils";

const PRODUCT_STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const PAGE_SIZE = 5;

function VendorProductsTab({ vendorId }: { vendorId: string }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .getVendorProducts(vendorId, page, PAGE_SIZE)
      .then((resp) => {
        if (cancelled) {
          return;
        }

        setProducts(resp.data);
        setTotal(resp.pagination.total);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, t("vendors.viewDialog.loadProductsFailed")), {
          title: t("common.failed", "Failed"),
        });
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [vendorId, page, t]);

  const columns: ColumnDef<Product>[] = [
    {
      key: "name",
      header: t("vendors.viewDialog.productsColumns.product"),
      render: (_v, row) => (
        <div className="flex items-center gap-2">
          {row.images[0] ? (
            <img src={row.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">{isAr && row.name.ar ? row.name.ar : row.name.en}</span>
        </div>
      ),
    },
    {
      key: "gender",
      header: t("vendors.viewDialog.productsColumns.department"),
      render: (v) => (
        <span className="capitalize">{t(`common.status.${v as string}`, v as string)}</span>
      ),
    },
    {
      key: "price",
      header: t("vendors.viewDialog.productsColumns.price"),
      render: (_v, row) =>
        row.compareAtPrice ? `${row.price} (was ${row.compareAtPrice})` : `${row.price}`,
    },
    { key: "stock", header: t("vendors.viewDialog.productsColumns.stock") },
    {
      key: "status",
      header: t("vendors.viewDialog.productsColumns.status"),
      render: (v) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            PRODUCT_STATUS_STYLES[v as string]
          )}
        >
          {t(`common.status.${v as string}`, v as string)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Product>
      data={products}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: PAGE_SIZE,
        serverSide: true,
        totalCount: total,
        onPageChange: (p) => setPage(p),
      }}
      emptyState={{
        title: t("vendors.viewDialog.emptyProducts"),
        description: t("vendors.viewDialog.emptyProductsDesc"),
      }}
    />
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: AdminVendorRow | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending_approval: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function VendorViewDialog({ open, onOpenChange, vendor }: Props) {
  const { t } = useTranslation();

  if (!vendor) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl min-h-[560px] max-h-[80vh]">
        <DialogHeader>
          <InitialsAvatar name={vendor.storeName} />
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg">{vendor.storeName}</DialogTitle>
            <p className="text-sm text-muted-foreground truncate">{vendor.ownerName ?? "—"}</p>
          </div>
          <span
            className={cn(
              "shrink-0 inline-block px-2.5 py-1 rounded-full text-xs font-medium",
              STATUS_STYLES[vendor.status]
            )}
          >
            {t(`common.status.${vendor.status}`, vendor.status.replace("_", " "))}
          </span>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 min-h-0">
          <TabsList className="px-6">
            <TabsTrigger value="details">
              <User className="h-3.5 w-3.5" />
              {t("vendors.viewDialog.tabs.details")}
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="h-3.5 w-3.5" />
              {t("vendors.viewDialog.tabs.products")}
            </TabsTrigger>
            <TabsTrigger value="verification">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("vendors.viewDialog.tabs.verification")}
            </TabsTrigger>
          </TabsList>

          <DialogBody className="pt-5 min-h-[360px]">
            <TabsContent value="details" className="flex flex-col gap-5">
              <DetailSection title={t("vendors.viewDialog.storeInfo")} icon={Store}>
                <DetailRow
                  icon={Store}
                  label={t("vendors.viewDialog.storeName")}
                  value={vendor.storeName}
                />
                <DetailRow icon={MapPin} label={t("vendors.viewDialog.city")} value={vendor.city} />
                <DetailRow
                  icon={Calendar}
                  label={t("vendors.viewDialog.submitted")}
                  value={new Date(vendor.createdAt).toLocaleString()}
                />
              </DetailSection>

              <DetailSection title={t("vendors.viewDialog.owner")} icon={User}>
                <DetailRow
                  icon={User}
                  label={t("vendors.viewDialog.ownerName")}
                  value={vendor.ownerName}
                />
                <DetailRow
                  icon={Phone}
                  label={t("vendors.viewDialog.phone")}
                  value={vendor.ownerPhone}
                />
                <DetailRow
                  icon={Mail}
                  label={t("vendors.viewDialog.email")}
                  value={vendor.ownerEmail}
                />
              </DetailSection>
            </TabsContent>

            <TabsContent value="products">
              <VendorProductsTab vendorId={vendor.id} />
            </TabsContent>

            <TabsContent value="verification">
              <DetailSection title={t("vendors.viewDialog.kycDocument")} icon={ShieldCheck}>
                <div className="col-span-full">
                  {vendor.kycDocumentUrl ? (
                    <a
                      href={vendor.kycDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5 text-sm hover:border-primary/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {t("vendors.viewDialog.businessLicense")}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("vendors.viewDialog.noDocument")}
                    </p>
                  )}
                </div>
              </DetailSection>
            </TabsContent>
          </DialogBody>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
