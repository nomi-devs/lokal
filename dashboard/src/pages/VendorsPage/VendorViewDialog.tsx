import { useEffect, useState } from "react";
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

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, DetailSection, InitialsAvatar } from "@/components/ui/DetailView";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { getApiErrorMessage } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toast";
import * as adminApi from "@/lib/adminApi";
import type { AdminProduct, AdminVendorRow } from "@/lib/adminApi";
import { cn } from "@/lib/utils";

const PRODUCT_STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  out_of_stock: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const PAGE_SIZE = 5;

function VendorProductsTab({ vendorId }: { vendorId: string }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .getVendorProducts(vendorId, page, PAGE_SIZE)
      .then((resp) => {
        if (cancelled) {return;}

        setProducts(resp.data);
        setTotal(resp.pagination.total);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Couldn't load products"), { title: "Load failed" });
      })
      .finally(() => {
        if (!cancelled) {setLoading(false);}
      });

    return () => {
      cancelled = true;
    };
  }, [vendorId, page]);

  const columns: ColumnDef<AdminProduct>[] = [
    {
      key: "nameEn",
      header: "Product",
      render: (_v, row) => (
        <div className="flex items-center gap-2">
          {row.images[0] ? (
            <img src={row.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">{row.nameEn}</span>
        </div>
      ),
    },
    { key: "department", header: "Department", render: (v) => <span className="capitalize">{v as string}</span> },
    {
      key: "price",
      header: "Price",
      render: (_v, row) => `${row.price.base} ${row.price.currency}`,
    },
    { key: "stock", header: "Stock" },
    {
      key: "status",
      header: "Status",
      render: (v) => (
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", PRODUCT_STATUS_STYLES[v as string])}>
          {(v as string).replace("_", " ")}
        </span>
      ),
    },
  ];

  return (
    <DataTable<AdminProduct>
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
      emptyState={{ title: "No products yet", description: "This vendor hasn't listed any products." }}
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
  if (!vendor) {return null;}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
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
            {vendor.status.replace("_", " ")}
          </span>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 min-h-0">
          <TabsList className="px-6">
            <TabsTrigger value="details">
              <User className="h-3.5 w-3.5" />
              Details
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="h-3.5 w-3.5" />
              Products
            </TabsTrigger>
            <TabsTrigger value="verification">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verification
            </TabsTrigger>
          </TabsList>

          <DialogBody className="pt-5">
            <TabsContent value="details" className="flex flex-col gap-5">
              <DetailSection title="Store Information" icon={Store}>
                <DetailRow icon={Store} label="Store name" value={vendor.storeName} />
                <DetailRow icon={MapPin} label="City" value={vendor.city} />
                <DetailRow icon={Calendar} label="Submitted" value={new Date(vendor.createdAt).toLocaleString()} />
              </DetailSection>

              <DetailSection title="Owner" icon={User}>
                <DetailRow icon={User} label="Owner name" value={vendor.ownerName} />
                <DetailRow icon={Phone} label="Phone" value={vendor.ownerPhone} />
                <DetailRow icon={Mail} label="Email" value={vendor.ownerEmail} />
              </DetailSection>
            </TabsContent>

            <TabsContent value="products">
              <VendorProductsTab vendorId={vendor.id} />
            </TabsContent>

            <TabsContent value="verification">
              <DetailSection title="KYC Document" icon={ShieldCheck}>
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
                        Business license / ID document
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No document submitted.</p>
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
