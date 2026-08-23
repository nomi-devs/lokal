import { useEffect, useState } from "react";
import { Calendar, Globe, Heart, Mail, MapPin, Package, Phone, ShieldCheck, User } from "lucide-react";

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, DetailSection, InitialsAvatar } from "@/components/ui/DetailView";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { getApiErrorMessage } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toast";
import * as adminApi from "@/lib/adminApi";
import type { AdminAddress, AdminUserRow, AdminWishlistItem } from "@/lib/adminApi";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

function UserWishlistTab({ userId }: { userId: string }) {
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
        if (cancelled) {return;}

        setItems(resp.data);
        setTotal(resp.pagination.total);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Couldn't load wishlist"), { title: "Load failed" });
      })
      .finally(() => {
        if (!cancelled) {setLoading(false);}
      });

    return () => {
      cancelled = true;
    };
  }, [userId, page]);

  const columns: ColumnDef<AdminWishlistItem>[] = [
    {
      key: "product",
      header: "Product",
      render: (_v, row) => (
        <div className="flex items-center gap-2">
          {row.product?.images[0] ? (
            <img src={row.product.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">{row.product?.nameEn ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (_v, row) => (row.product ? `${row.product.price.base} ${row.product.price.currency}` : "—"),
    },
    { key: "addedAt", header: "Added", render: (v) => new Date(v as string).toLocaleDateString() },
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
      emptyState={{ title: "No wishlist items", description: "This user hasn't saved any products." }}
    />
  );
}

function UserAddressesTab({ userId }: { userId: string }) {
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
        if (cancelled) {return;}

        setItems(resp.data);
        setTotal(resp.pagination.total);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Couldn't load addresses"), { title: "Load failed" });
      })
      .finally(() => {
        if (!cancelled) {setLoading(false);}
      });

    return () => {
      cancelled = true;
    };
  }, [userId, page]);

  const columns: ColumnDef<AdminAddress>[] = [
    {
      key: "recipientName",
      header: "Recipient",
      render: (_v, row) => (
        <div>
          <p className="font-medium">{row.recipientName}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {row.type}
            {row.isDefault ? " · Default" : ""}
          </p>
        </div>
      ),
    },
    { key: "phone", header: "Phone" },
    {
      key: "address",
      header: "Address",
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
      emptyState={{ title: "No addresses", description: "This user hasn't saved any addresses." }}
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
  if (!user) {return null;}

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <InitialsAvatar name={fullName || user.phone} />
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg">{fullName || "—"}</DialogTitle>
            <p className="text-sm text-muted-foreground truncate capitalize">{user.role}</p>
          </div>
          <span
            className={cn(
              "shrink-0 inline-block px-2.5 py-1 rounded-full text-xs font-medium",
              STATUS_STYLES[user.status]
            )}
          >
            {user.status}
          </span>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 min-h-0">
          <TabsList className="px-6">
            <TabsTrigger value="details">
              <User className="h-3.5 w-3.5" />
              Details
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="h-3.5 w-3.5" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="h-3.5 w-3.5" />
              Addresses
            </TabsTrigger>
          </TabsList>

          <DialogBody className="pt-5">
            <TabsContent value="details" className="flex flex-col gap-5">
              <DetailSection title="Contact Information" icon={User}>
                <DetailRow icon={Phone} label="Phone" value={user.phone} />
                <DetailRow icon={Mail} label="Email" value={user.email} />
                <DetailRow icon={Globe} label="Language" value={user.language.toUpperCase()} />
                <DetailRow icon={ShieldCheck} label="Phone verified" value={user.isPhoneVerified ? "Yes" : "No"} />
              </DetailSection>

              <DetailSection title="Account" icon={Calendar}>
                <DetailRow icon={Calendar} label="Created" value={new Date(user.createdAt).toLocaleString()} />
                <DetailRow
                  icon={Calendar}
                  label="Last login"
                  value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
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
