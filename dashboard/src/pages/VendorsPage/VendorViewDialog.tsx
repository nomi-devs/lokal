import { useTranslation } from "react-i18next";
import {
  Store,
  Mail,
  Phone,
  Tag,
  MapPin,
  Star,
  FileText,
  User,
  Percent,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Package,
  ShoppingBag,
  Clock,
  XCircle,
  Truck,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

import type { Vendor, VendorStatus } from "@/data/vendors";
import { products, type Product, type ProductStatus } from "@/data/products";
import { orders } from "@/data/orders";
import { reviews } from "@/data/reviews";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────
const avatarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-teal-500",
];
const avatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const approvalStyle: Record<VendorStatus, { text: string; bg: string; dot: string }> = {
  pending: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    dot: "bg-amber-400",
  },
  approved: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  rejected: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
  suspended: { text: "text-muted-foreground", bg: "bg-muted", dot: "bg-slate-400" },
};

const productStatusStyle: Record<ProductStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  out_of_stock: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const productStatusKey: Record<ProductStatus, string> = {
  active: "active",
  inactive: "inactive",
  out_of_stock: "outOfStock",
};

const orderStatusStyle: Record<string, { text: string; bg: string; icon: React.ElementType }> = {
  pending: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: Clock,
  },
  confirmed: {
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: CheckCircle2,
  },
  preparing: {
    text: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    icon: Package,
  },
  ready_for_pickup: {
    text: "text-fuchsia-700 dark:text-fuchsia-400",
    bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
    icon: ShoppingBag,
  },
  in_transit: {
    text: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    icon: Truck,
  },
  delivered: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    icon: CheckCircle,
  },
  cancelled: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    icon: XCircle,
  },
};

const reviewStatusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const StatusBadge = ({
  text,
  bg,
  icon: Icon,
  label,
}: {
  text: string;
  bg: string;
  icon: React.ElementType;
  label: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
      text,
      bg
    )}
  >
    <Icon className="w-3 h-3" />
    {label}
  </span>
);

type Tab = "details" | "products" | "orders" | "reviews" | "documents";

// ── Row shapes fed to DataTable (denormalized for easy search/sort) ───────────
type OrderRow = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
};
type ReviewRow = {
  id: number;
  product: string;
  title: string;
  comment: string;
  rating: number;
  status: string;
  createdAt: string;
};
type DocumentRow = { id: number; type: string; url: string; uploadedAt: string };

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-sm font-semibold">{value || "—"}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export default function VendorViewDialog({ open, onOpenChange, vendor }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("details");

  if (!vendor) {
    return null;
  }

  const avatarBg = avatarColor(vendor.nameEn);

  const initials = vendor.nameEn
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const vendorProducts: Product[] = products.filter((p) => p.vendorId === vendor.id);
  const vendorProductIds = new Set(vendorProducts.map((p) => p.id));

  const orderRows: OrderRow[] = orders
    .map((o) => ({ order: o, split: o.vendorOrders.find((vo) => vo.vendorId === vendor.id) }))
    .filter(
      (x): x is { order: (typeof orders)[number]; split: NonNullable<typeof x.split> } => !!x.split
    )
    .map(({ order, split }) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: split.status,
      totalAmount: split.totalAmount,
      createdAt: order.createdAt,
    }));

  const reviewRows: ReviewRow[] = reviews
    .filter((r) => vendorProductIds.has(r.productId))
    .map((r) => ({
      id: r.id,
      product: products.find((p) => p.id === r.productId)?.nameEn ?? "—",
      title: r.titleEn,
      comment: r.commentEn,
      rating: r.rating,
      status: r.status,
      createdAt: r.createdAt,
    }));

  const documentRows: DocumentRow[] = vendor.documents.map((doc, i) => ({
    id: i,
    type: doc.type,
    url: doc.url,
    uploadedAt: doc.uploadedAt,
  }));

  const tabs: { id: Tab; icon: React.ElementType; label: string; count?: number }[] = [
    { id: "details", icon: Store, label: t("vendors.view.tabs.details") },
    {
      id: "products",
      icon: Package,
      label: t("vendors.view.tabs.products"),
      count: vendorProducts.length,
    },
    {
      id: "orders",
      icon: ShoppingBag,
      label: t("vendors.view.tabs.orders"),
      count: orderRows.length,
    },
    { id: "reviews", icon: Star, label: t("vendors.view.tabs.reviews"), count: reviewRows.length },
    {
      id: "documents",
      icon: FileText,
      label: t("vendors.view.tabs.documents"),
      count: documentRows.length,
    },
  ];

  // ── Columns ───────────────────────────────────────────────────────────────
  const productColumns: ColumnDef<Product>[] = [
    {
      key: "nameEn",
      header: t("products.list.columns.product"),
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 min-w-0">
          {row.images[0] ? (
            <img
              src={row.images[0]}
              alt={row.nameEn}
              className="w-8 h-8 rounded-md object-cover shrink-0"
            />
          ) : (
            <span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-muted-foreground" />
            </span>
          )}
          <span className="text-sm font-medium truncate">{row.nameEn}</span>
        </div>
      ),
    },
    { key: "stock", header: t("products.list.columns.stock"), sortable: true, align: "right" },
    {
      key: "price",
      header: t("products.list.columns.price"),
      render: (_, row) => `${row.price.base} ${row.price.currency}`,
    },
    {
      key: "status",
      header: t("products.list.columns.status"),
      sortable: true,
      render: (v) => (
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            productStatusStyle[v as ProductStatus]
          )}
        >
          {t(`products.list.status.${productStatusKey[v as ProductStatus]}`, v as string)}
        </span>
      ),
    },
    {
      key: "ratings",
      header: t("products.list.columns.rating"),
      render: (_, row) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {row.ratings.average.toFixed(1)}
        </span>
      ),
    },
  ];

  const orderColumns: ColumnDef<OrderRow>[] = [
    { key: "orderNumber", header: t("orders.columns.order"), sortable: true },
    {
      key: "status",
      header: t("orders.columns.status"),
      sortable: true,
      render: (v) => {
        const s = orderStatusStyle[v as string];

        return <StatusBadge {...s} label={t(`common.status.${v as string}`, v as string)} />;
      },
    },
    {
      key: "totalAmount",
      header: t("orders.columns.total"),
      sortable: true,
      align: "right",
      render: (v) => `${(v as number).toFixed(2)} KWD`,
    },
    { key: "createdAt", header: t("orders.columns.date"), sortable: true },
  ];

  const reviewColumns: ColumnDef<ReviewRow>[] = [
    { key: "product", header: t("reviews.list.columns.product"), sortable: true },
    {
      key: "title",
      header: t("reviews.list.columns.review"),
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{row.title}</p>
          <p className="text-xs text-muted-foreground truncate">{row.comment}</p>
        </div>
      ),
    },
    {
      key: "rating",
      header: t("reviews.list.columns.rating"),
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3.5 h-3.5",
                i < (v as number) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: t("reviews.list.columns.status"),
      sortable: true,
      render: (v) => (
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            reviewStatusStyle[v as string]
          )}
        >
          {t(`common.status.${v as string}`, v as string)}
        </span>
      ),
    },
    { key: "createdAt", header: t("reviews.list.columns.date"), sortable: true },
  ];

  const documentColumns: ColumnDef<DocumentRow>[] = [
    { key: "type", header: t("vendors.view.columns.documentType"), sortable: true },
    { key: "uploadedAt", header: t("vendors.view.columns.uploadedAt"), sortable: true },
    {
      key: "url",
      header: t("vendors.columns.actions"),
      align: "right",
      render: (v) => (
        <a
          href={v as string}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-5xl h-[85vh] flex flex-col gap-0">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b shrink-0">
          <div
            className={cn(
              "w-14 h-14 rounded-lg flex items-center justify-center text-lg font-bold text-white shrink-0",
              avatarBg
            )}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-bold">{vendor.nameEn}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {vendor.ownerName} · {vendor.email}
            </DialogDescription>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0",
              approvalStyle[vendor.status].text,
              approvalStyle[vendor.status].bg
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", approvalStyle[vendor.status].dot)} />
            {t(`common.status.${vendor.status}`, vendor.status)}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b px-6 shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[1.25rem] text-center",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── Details ── */}
          {activeTab === "details" && (
            <div className="rounded-xl border p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-5">
                <Store className="w-4 h-4 text-primary" />
                {t("vendors.view.basicInfo")}
              </h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <InfoField
                  icon={User}
                  label={t("vendors.dialog.ownerName")}
                  value={vendor.ownerName}
                />
                <InfoField icon={Mail} label={t("vendors.dialog.email")} value={vendor.email} />
                <InfoField icon={Phone} label={t("vendors.dialog.phone")} value={vendor.phone} />
                <InfoField
                  icon={Tag}
                  label={t("vendors.dialog.category")}
                  value={vendor.category}
                />
                <InfoField icon={MapPin} label={t("vendors.dialog.city")} value={vendor.city} />
                <InfoField
                  icon={Percent}
                  label={t("vendors.dialog.commission")}
                  value={
                    vendor.commission.type === "percentage"
                      ? `${vendor.commission.value}%`
                      : `${vendor.commission.value} KWD`
                  }
                />
                {vendor.businessLicense && (
                  <InfoField
                    icon={ShieldCheck}
                    label={t("vendors.view.businessLicense")}
                    value={vendor.businessLicense}
                  />
                )}
                {vendor.taxId && (
                  <InfoField icon={FileText} label={t("vendors.view.taxId")} value={vendor.taxId} />
                )}
                <InfoField
                  icon={Calendar}
                  label={t("vendors.view.joined")}
                  value={new Date(vendor.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
                {vendor.approvedAt && (
                  <InfoField
                    icon={CheckCircle2}
                    label={t("vendors.view.approvedOn")}
                    value={new Date(vendor.approvedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  />
                )}
                {vendor.rating != null && (
                  <InfoField
                    icon={Star}
                    label={t("vendors.dialog.rating")}
                    value={
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {vendor.rating}
                      </span>
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {activeTab === "products" && (
            <DataTable<Product>
              data={vendorProducts}
              columns={productColumns}
              rowKey="id"
              searchable
              searchKeys={["nameEn", "nameAr"]}
              searchPlaceholder={t("products.list.searchPlaceholder")}
              pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
              defaultSort={{ key: "updatedAt", direction: "desc" }}
              striped
              emptyState={{ title: t("vendors.view.empty.products") }}
            />
          )}

          {/* ── Orders ── */}
          {activeTab === "orders" && (
            <DataTable<OrderRow>
              data={orderRows}
              columns={orderColumns}
              rowKey="id"
              searchable
              searchKeys={["orderNumber"]}
              searchPlaceholder={t("orders.searchPlaceholder")}
              pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
              defaultSort={{ key: "createdAt", direction: "desc" }}
              striped
              emptyState={{ title: t("vendors.view.empty.orders") }}
            />
          )}

          {/* ── Reviews ── */}
          {activeTab === "reviews" && (
            <DataTable<ReviewRow>
              data={reviewRows}
              columns={reviewColumns}
              rowKey="id"
              searchable
              searchKeys={["product", "title", "comment"]}
              searchPlaceholder={t("reviews.list.searchPlaceholder")}
              pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
              defaultSort={{ key: "createdAt", direction: "desc" }}
              striped
              emptyState={{ title: t("vendors.view.empty.reviews") }}
            />
          )}

          {/* ── Documents ── */}
          {activeTab === "documents" && (
            <DataTable<DocumentRow>
              data={documentRows}
              columns={documentColumns}
              rowKey="id"
              searchable
              searchKeys={["type"]}
              pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
              defaultSort={{ key: "uploadedAt", direction: "desc" }}
              striped
              emptyState={{ title: t("vendors.view.empty.documents") }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
