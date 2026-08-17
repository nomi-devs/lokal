import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  User, Mail, Phone, Shield, Calendar, Globe, CheckCircle2,
  Link2, MapPin, Star, Heart, CreditCard, ShoppingBag,
  Package, Clock, XCircle, Truck, CheckCircle, AlertCircle,
} from "lucide-react";

import type { User as UserType } from "@/data/users";
import { orders } from "@/data/orders";
import { reviews } from "@/data/reviews";
import { wishlists } from "@/data/wishlists";
import { addresses, type AddressType } from "@/data/addresses";
import { payments } from "@/data/payments";
import { products } from "@/data/products";
import { initialVendors } from "@/data/vendors";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────
const avatarColors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500"];
const avatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const statusDot: Record<string, string> = { active: "bg-emerald-500", suspended: "bg-red-500", inactive: "bg-amber-400" };
const statusText: Record<string, string> = { active: "text-emerald-500", suspended: "text-red-500", inactive: "text-amber-400" };

const orderStatusStyle: Record<string, { text: string; bg: string; icon: React.ElementType }> = {
  pending:   { text: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900/30",   icon: Clock },
  confirmed: { text: "text-blue-700 dark:text-blue-400",     bg: "bg-blue-100 dark:bg-blue-900/30",     icon: CheckCircle2 },
  shipped:   { text: "text-violet-700 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30", icon: Truck },
  delivered: { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle },
  cancelled: { text: "text-red-700 dark:text-red-400",       bg: "bg-red-100 dark:bg-red-900/30",       icon: XCircle },
};

const paymentStatusStyle: Record<string, { text: string; bg: string; icon: React.ElementType }> = {
  success: { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle2 },
  pending: { text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-100 dark:bg-amber-900/30",     icon: Clock },
  failed:  { text: "text-red-700 dark:text-red-400",         bg: "bg-red-100 dark:bg-red-900/30",         icon: AlertCircle },
};

const reviewStatusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const addressTypeStyle: Record<AddressType, string> = {
  home: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  office: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  other: "bg-muted text-muted-foreground",
};

const StatusBadge = ({ text, bg, icon: Icon, label }: { text: string; bg: string; icon: React.ElementType; label: string }) => (
  <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full", text, bg)}>
    <Icon className="w-3 h-3" />
    {label}
  </span>
);

type Tab = "details" | "orders" | "reviews" | "wishlist" | "addresses" | "payments";

// ── Row shapes fed to DataTable (denormalized for easy search/sort) ───────────
type OrderRow = { id: number; orderNumber: string; itemsSummary: string; status: string; total: number; createdAt: string };
type ReviewRow = { id: number; product: string; title: string; comment: string; rating: number; status: string; createdAt: string };
type WishlistRow = { id: number; product: string; image?: string; vendor: string; price: string; addedAt: string };
type PaymentRow = { id: number; method: string; orderNumber: string; amount: number; currency: string; status: string; createdAt: string };

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />{label}
      </span>
      <span className="text-sm font-semibold">{value || "—"}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
}

export default function UserViewDialog({ open, onOpenChange, user }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("details");

  if (!user) {return null;}

  const name = `${user.firstName} ${user.lastName}`.trim();
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const orderRows: OrderRow[] = orders
    .filter((o) => o.userId === user.id)
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      itemsSummary: o.items.map((i) => `${i.productNameEn} ×${i.qty}`).join(", "),
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
    }));

  const reviewRows: ReviewRow[] = reviews
    .filter((r) => r.userId === user.id)
    .map((r) => ({
      id: r.id,
      product: products.find((p) => p.id === r.productId)?.nameEn ?? "—",
      title: r.titleEn,
      comment: r.commentEn,
      rating: r.rating,
      status: r.status,
      createdAt: r.createdAt,
    }));

  const wishlistRows: WishlistRow[] = wishlists
    .filter((w) => w.userId === user.id)
    .map((w) => {
      const product = products.find((p) => p.id === w.productId);
      const vendor = product ? initialVendors.find((v) => v.id === product.vendorId) : undefined;

      return {
        id: w.id,
        product: product?.nameEn ?? "—",
        image: product?.images[0],
        vendor: vendor?.nameEn ?? "—",
        price: product ? `${product.price.base.toFixed(2)} ${product.price.currency}` : "—",
        addedAt: w.addedAt,
      };
    });

  const userAddresses = addresses.filter((a) => a.userId === user.id);

  const paymentRows: PaymentRow[] = payments
    .filter((p) => p.userId === user.id)
    .map((p) => ({
      id: p.id,
      method: t(`payments.method.${p.method}`, p.method),
      orderNumber: orders.find((o) => o.id === p.orderId)?.orderNumber ?? p.transactionId,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt,
    }));

  const tabs: { id: Tab; icon: React.ElementType; label: string; count?: number }[] = [
    { id: "details",   icon: User,        label: t("users.view.tabs.details") },
    { id: "orders",    icon: ShoppingBag, label: t("users.view.tabs.orders"),    count: orderRows.length },
    { id: "reviews",   icon: Star,        label: t("users.view.tabs.reviews"),   count: reviewRows.length },
    { id: "wishlist",  icon: Heart,       label: t("users.view.tabs.wishlist"),  count: wishlistRows.length },
    { id: "addresses", icon: MapPin,      label: t("users.view.tabs.addresses"), count: userAddresses.length },
    { id: "payments",  icon: CreditCard,  label: t("users.view.tabs.payments"),  count: paymentRows.length },
  ];

  // ── Columns ───────────────────────────────────────────────────────────────
  const orderColumns: ColumnDef<OrderRow>[] = [
    { key: "orderNumber", header: t("orders.columns.order"), sortable: true },
    { key: "itemsSummary", header: t("orders.columns.items") },
    {
      key: "status",
      header: t("orders.columns.status"),
      sortable: true,
      render: (v) => {
        const s = orderStatusStyle[v as string];

        return <StatusBadge {...s} label={t(`common.status.${v as string}`, v as string)} />;
      },
    },
    { key: "total", header: t("orders.columns.total"), sortable: true, align: "right", render: (v) => `KWD ${(v as number).toFixed(2)}` },
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
            <Star key={i} className={cn("w-3.5 h-3.5", i < (v as number) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: t("reviews.list.columns.status"),
      sortable: true,
      render: (v) => (
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", reviewStatusStyle[v as string])}>
          {t(`common.status.${v as string}`, v as string)}
        </span>
      ),
    },
    { key: "createdAt", header: t("reviews.list.columns.date"), sortable: true },
  ];

  const wishlistColumns: ColumnDef<WishlistRow>[] = [
    {
      key: "product",
      header: t("products.list.columns.product"),
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 min-w-0">
          {row.image ? (
            <img src={row.image} alt={row.product} className="w-8 h-8 rounded-md object-cover shrink-0" />
          ) : (
            <span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-muted-foreground" />
            </span>
          )}
          <span className="text-sm font-medium truncate">{row.product}</span>
        </div>
      ),
    },
    { key: "vendor", header: t("vendors.columns.vendor"), sortable: true },
    { key: "price", header: t("products.list.columns.price"), align: "right" },
    { key: "addedAt", header: t("users.view.columns.addedDate"), sortable: true },
  ];

  const addressColumns: ColumnDef<(typeof userAddresses)[number]>[] = [
    {
      key: "type",
      header: t("addresses.list.columns.type"),
      sortable: true,
      render: (v) => (
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", addressTypeStyle[v as AddressType])}>
          {t(`addresses.types.${v as string}`, v as string)}
        </span>
      ),
    },
    { key: "recipientName", header: t("addresses.list.columns.recipient"), sortable: true },
    { key: "address", header: t("addresses.list.columns.address") },
    { key: "city", header: t("addresses.list.columns.location"), sortable: true, render: (_, row) => `${row.city}, ${row.country}` },
    { key: "phone", header: t("addresses.list.columns.phone") },
    {
      key: "isDefault",
      header: t("addresses.dialog.isDefault"),
      render: (v) => v ? (
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
          {t("users.view.defaultAddress")}
        </span>
      ) : null,
    },
  ];

  const paymentColumns: ColumnDef<PaymentRow>[] = [
    { key: "method", header: t("payments.list.columns.method"), sortable: true },
    { key: "orderNumber", header: t("payments.list.columns.order"), sortable: true },
    { key: "amount", header: t("payments.list.columns.amount"), sortable: true, align: "right", render: (v, row) => `${(v as number).toFixed(2)} ${row.currency}` },
    {
      key: "status",
      header: t("payments.list.columns.status"),
      sortable: true,
      render: (v) => {
        const s = paymentStatusStyle[v as string];

        return <StatusBadge {...s} label={t(`common.status.${v as string}`, v as string)} />;
      },
    },
    { key: "createdAt", header: t("payments.list.columns.date"), sortable: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-5xl h-[85vh] flex flex-col gap-0">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b shrink-0">
          <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0", avatarColor(name))}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-bold">{name}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {user.username ? `@${user.username}` : user.email || user.phone}
            </DialogDescription>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b px-6 shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[1.25rem] text-center",
                  activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
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
                <User className="w-4 h-4 text-primary" />
                {t("users.view.basicInfo")}
              </h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <InfoField icon={Mail} label={t("users.view.email")} value={user.email} />
                <InfoField icon={Phone} label={t("users.view.phone")} value={user.phone} />
                <InfoField icon={Shield} label={t("users.view.role")} value={t(`common.status.${user.role}`, user.role)} />
                <InfoField
                  icon={Calendar} label={t("users.view.joined")}
                  value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                />
                <InfoField icon={CheckCircle2} label={t("users.view.verification")} value={t("users.view.verified")} />
                <InfoField
                  icon={User} label={t("users.view.status")}
                  value={
                    <span className={cn("inline-flex items-center gap-1.5", statusText[user.status])}>
                      <span className={cn("w-2 h-2 rounded-full", statusDot[user.status])} />
                      {t(`common.status.${user.status}`, user.status)}
                    </span>
                  }
                />
                <InfoField icon={Link2} label={t("users.view.authType")} value={user.phone ? t("users.view.phone") : t("users.view.email")} />
                <InfoField icon={Globe} label={t("users.view.language")} value={user.language === "ar" ? "العربية" : "English"} />
                {user.gender && <InfoField icon={User} label={t("users.view.gender")} value={user.gender} />}
                {user.birthday && (
                  <InfoField icon={Calendar} label={t("users.view.birthday")}
                    value={new Date(user.birthday).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
                )}
                {user.lastLogin && (
                  <InfoField icon={Calendar} label={t("users.view.lastLogin")}
                    value={new Date(user.lastLogin).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
                )}
                {user.username && <InfoField icon={User} label={t("users.view.username")} value={`@${user.username}`} />}
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {activeTab === "orders" && (
            <DataTable<OrderRow>
              data={orderRows}
              columns={orderColumns}
              rowKey="id"
              searchable
              searchKeys={["orderNumber", "itemsSummary"]}
              searchPlaceholder={t("orders.searchPlaceholder")}
              pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
              defaultSort={{ key: "createdAt", direction: "desc" }}
              striped
              emptyState={{ title: t("users.view.empty.orders") }}
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
              emptyState={{ title: t("users.view.empty.reviews") }}
            />
          )}

          {/* ── Wishlist ── */}
          {activeTab === "wishlist" && (
            <DataTable<WishlistRow>
              data={wishlistRows}
              columns={wishlistColumns}
              rowKey="id"
              searchable
              searchKeys={["product", "vendor"]}
              pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
              defaultSort={{ key: "addedAt", direction: "desc" }}
              striped
              emptyState={{ title: t("users.view.empty.wishlist") }}
            />
          )}

          {/* ── Addresses ── */}
          {activeTab === "addresses" && (
            <DataTable<(typeof userAddresses)[number]>
              data={userAddresses}
              columns={addressColumns}
              rowKey="id"
              searchable
              searchKeys={["recipientName", "address", "city", "phone"]}
              searchPlaceholder={t("addresses.list.searchPlaceholder")}
              pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
              defaultSort={{ key: "updatedAt", direction: "desc" }}
              striped
              emptyState={{ title: t("users.view.empty.addresses") }}
            />
          )}

          {/* ── Payments ── */}
          {activeTab === "payments" && (
            <DataTable<PaymentRow>
              data={paymentRows}
              columns={paymentColumns}
              rowKey="id"
              searchable
              searchKeys={["method", "orderNumber"]}
              searchPlaceholder={t("payments.list.searchPlaceholder")}
              pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
              defaultSort={{ key: "createdAt", direction: "desc" }}
              striped
              emptyState={{ title: t("users.view.empty.payments") }}
            />
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
