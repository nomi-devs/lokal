import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Globe,
  Heart,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
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
import { DataTable, renderDate } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { getApiErrorMessage } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toast";
import * as adminApi from "@/lib/adminApi";
import type { AdminAddress, AdminUserRow, AdminWishlistItem } from "@/lib/adminApi";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

function UserWishlistTab({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<AdminWishlistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .getUserWishlist(userId, page, PAGE_SIZE)
      .then((resp) => {
        if (cancelled) {
          return;
        }

        setItems(resp.data);
        setTotal(resp.pagination.total);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, t("users.viewDialog.loadWishlistFailed")), {
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
  }, [userId, page, t]);

  const columns: ColumnDef<AdminWishlistItem>[] = [
    {
      key: "product",
      header: t("users.viewDialog.wishlistColumns.product"),
      render: (_v, row) => (
        <div className="flex items-center gap-2">
          {row.product?.images[0] ? (
            <img src={row.product.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">{row.product?.name.en ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "price",
      header: t("users.viewDialog.wishlistColumns.price"),
      render: (_v, row) => (row.product ? `${row.product.price}` : "—"),
    },
    {
      key: "createdAt",
      header: t("users.viewDialog.wishlistColumns.added"),
      render: renderDate,
    },
  ];

  return (
    <DataTable<AdminWishlistItem>
      data={items}
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
        title: t("users.viewDialog.emptyWishlist"),
        description: t("users.viewDialog.emptyWishlistDesc"),
      }}
    />
  );
}

function UserAddressesTab({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<AdminAddress[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .getUserAddresses(userId, page, PAGE_SIZE)
      .then((resp) => {
        if (cancelled) {
          return;
        }

        setItems(resp.data);
        setTotal(resp.pagination.total);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, t("users.viewDialog.loadAddressesFailed")), {
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
  }, [userId, page, t]);

  const columns: ColumnDef<AdminAddress>[] = [
    {
      key: "recipientName",
      header: t("users.viewDialog.addressColumns.recipient"),
      render: (_v, row) => (
        <div>
          <p className="font-medium">{row.recipientName}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {row.type}
            {row.isDefault ? ` · ${t("users.viewDialog.addressColumns.default")}` : ""}
          </p>
        </div>
      ),
    },
    { key: "phone", header: t("users.viewDialog.addressColumns.phone") },
    {
      key: "address",
      header: t("users.viewDialog.addressColumns.address"),
      render: (_v, row) => `${row.address}, ${row.city}, ${row.country}`,
    },
  ];

  return (
    <DataTable<AdminAddress>
      data={items}
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
        title: t("users.viewDialog.emptyAddresses"),
        description: t("users.viewDialog.emptyAddressesDesc"),
      }}
    />
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserRow | null;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  deleted: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

export default function UserViewDialog({ open, onOpenChange, user }: Props) {
  const { t } = useTranslation();

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl min-h-[560px] max-h-[80vh]">
        <DialogHeader>
          <InitialsAvatar name={fullName || user.phone} />
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg">{fullName || "—"}</DialogTitle>
            <p className="text-sm text-muted-foreground truncate capitalize">
              {t(`common.status.${user.role}`, user.role)}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 inline-block px-2.5 py-1 rounded-full text-xs font-medium",
              STATUS_STYLES[user.status]
            )}
          >
            {t(`common.status.${user.status}`, user.status)}
          </span>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 min-h-0">
          <TabsList className="px-6">
            <TabsTrigger value="details">
              <User className="h-3.5 w-3.5" />
              {t("users.viewDialog.tabs.details")}
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="h-3.5 w-3.5" />
              {t("users.viewDialog.tabs.wishlist")}
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="h-3.5 w-3.5" />
              {t("users.viewDialog.tabs.addresses")}
            </TabsTrigger>
          </TabsList>

          <DialogBody className="pt-5 min-h-[360px]">
            <TabsContent value="details" className="flex flex-col gap-5">
              <DetailSection title={t("users.viewDialog.contactInfo")} icon={User}>
                <DetailRow icon={Phone} label={t("users.viewDialog.phone")} value={user.phone} />
                <DetailRow icon={Mail} label={t("users.viewDialog.email")} value={user.email} />
                <DetailRow
                  icon={Globe}
                  label={t("users.viewDialog.language")}
                  value={user.language.toUpperCase()}
                />
                <DetailRow
                  icon={ShieldCheck}
                  label={t("users.viewDialog.phoneVerified")}
                  value={
                    user.isPhoneVerified ? t("users.viewDialog.yes") : t("users.viewDialog.no")
                  }
                />
              </DetailSection>

              <DetailSection title={t("users.viewDialog.account")} icon={Calendar}>
                <DetailRow
                  icon={Calendar}
                  label={t("users.viewDialog.created")}
                  value={new Date(user.createdAt).toLocaleString()}
                />
                <DetailRow
                  icon={Calendar}
                  label={t("users.viewDialog.lastLogin")}
                  value={
                    user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : t("users.viewDialog.never")
                  }
                />
              </DetailSection>
            </TabsContent>

            <TabsContent value="wishlist">
              <UserWishlistTab userId={user.id} />
            </TabsContent>

            <TabsContent value="addresses">
              <UserAddressesTab userId={user.id} />
            </TabsContent>
          </DialogBody>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
