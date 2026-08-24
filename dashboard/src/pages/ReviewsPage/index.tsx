import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Star,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Plus,
  ShieldCheck,
} from "lucide-react";

import ReviewFormDialog, { type ReviewFormValues } from "./ReviewFormDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { recomputeProductRating } from "@/lib/ratings";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { reviews as initialReviews, type Review, type ReviewStatus } from "@/data/reviews";
import { products } from "@/data/products";
import { orders } from "@/data/orders";
import { users } from "@/data/users";

// ── Lookups ───────────────────────────────────────────────────────────────────
const productOptions = products.map((p) => ({ id: p.id, name: p.nameEn }));
const orderOptions = orders.map((o) => ({ id: o.id, name: o.orderNumber }));
const userOptions = users.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`.trim() }));

const productName = (id: number) => products.find((p) => p.id === id)?.nameEn ?? "—";

const userName = (id: number) => {
  const u = users.find((u) => u.id === id);

  return u ? `${u.firstName} ${u.lastName}`.trim() : "—";
};

// ── Style maps ────────────────────────────────────────────────────────────────
const statusStyle: Record<ReviewStatus, { text: string; bg: string; dot: string }> = {
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
};

// ── Star rating ───────────────────────────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "w-3.5 h-3.5",
            n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
}

// ── Confirm dialog state ────────────────────────────────────────────────────────
type PendingAction =
  | { type: "delete"; review: Review }
  | { type: "deleteSelected"; reviews: Review[] }
  | null;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoading();
  const [reviewList, setReviewList] = useState<Review[]>(initialReviews);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const pendingCount = reviewList.filter((r) => r.status === "pending").length;
  const approvedCount = reviewList.filter((r) => r.status === "approved").length;

  const avgRating = reviewList.length
    ? (reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length).toFixed(1)
    : "0.0";

  function openAddDialog() {
    setEditingReview(null);
    setDialogOpen(true);
  }

  function openEditDialog(review: Review) {
    setEditingReview(review);
    setDialogOpen(true);
  }

  function handleFormSubmit(values: ReviewFormValues, editingId: number | null) {
    const now = new Date().toISOString();

    const parsed = {
      productId: Number(values.productId),
      orderId: Number(values.orderId),
      userId: Number(values.userId),
      rating: values.rating,
      titleEn: values.titleEn,
      titleAr: values.titleAr,
      commentEn: values.commentEn,
      commentAr: values.commentAr,
      isVerifiedPurchase: values.isVerifiedPurchase,
      status: values.status,
    };

    if (editingId != null) {
      setReviewList((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...parsed, updatedAt: now } : r))
      );
      toast.success(t("reviews.list.toasts.edited", { title: values.titleEn }));

      return;
    }

    const nextId = Math.max(0, ...reviewList.map((r) => r.id)) + 1;

    setReviewList((prev) => [
      ...prev,
      {
        ...parsed,
        id: nextId,
        images: [],
        createdAt: now,
        updatedAt: now,
      },
    ]);
    toast.success(t("reviews.list.toasts.created", { title: values.titleEn }));
  }

  function approve(review: Review) {
    const now = new Date().toISOString();

    const updated = reviewList.map((r) =>
      r.id === review.id
        ? { ...r, status: "approved" as ReviewStatus, approvedAt: now, updatedAt: now }
        : r
    );

    setReviewList(updated);
    recomputeProductRating(review.productId, updated);
    toast.success(t("reviews.list.toasts.approvedBody", { title: review.titleEn }), {
      title: t("reviews.list.toasts.approvedTitle"),
    });
  }

  function reject(review: Review) {
    const now = new Date().toISOString();

    const updated = reviewList.map((r) =>
      r.id === review.id ? { ...r, status: "rejected" as ReviewStatus, updatedAt: now } : r
    );

    setReviewList(updated);
    recomputeProductRating(review.productId, updated);
    toast.error(t("reviews.list.toasts.rejectedBody", { title: review.titleEn }), {
      title: t("reviews.list.toasts.rejectedTitle"),
    });
  }

  function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "delete") {
      const { review } = pendingAction;
      const updated = reviewList.filter((r) => r.id !== review.id);

      setReviewList(updated);
      recomputeProductRating(review.productId, updated);
      toast.error(t("reviews.list.toasts.deleted", { title: review.titleEn }));
    } else if (pendingAction.type === "deleteSelected") {
      const ids = new Set(pendingAction.reviews.map((r) => r.id));
      const updated = reviewList.filter((r) => !ids.has(r.id));

      setReviewList(updated);

      const affectedProductIds = new Set(pendingAction.reviews.map((r) => r.productId));
      affectedProductIds.forEach((productId) => recomputeProductRating(productId, updated));
      toast.error(
        t("reviews.list.toasts.deletedSelected", { count: pendingAction.reviews.length })
      );
    }
  }

  const reviewColumns: ColumnDef<Review>[] = [
    {
      key: "titleEn",
      header: t("reviews.list.columns.review"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0 max-w-xs">
          <p className="font-medium text-sm truncate">{row.titleEn}</p>
          <p className="text-xs text-muted-foreground truncate">{row.commentEn}</p>
        </div>
      ),
    },
    {
      key: "productId",
      header: t("reviews.list.columns.product"),
      sortable: true,
      render: (v) => <span className="text-sm">{productName(v as number)}</span>,
    },
    {
      key: "userId",
      header: t("reviews.list.columns.reviewer"),
      sortable: true,
      render: (v) => <span className="text-sm">{userName(v as number)}</span>,
    },
    {
      key: "rating",
      header: t("reviews.list.columns.rating"),
      sortable: true,
      render: (v) => <RatingStars rating={v as number} />,
    },
    {
      key: "isVerifiedPurchase",
      header: t("reviews.list.columns.verified"),
      render: (v) =>
        v ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30">
            <ShieldCheck className="w-3 h-3" />
            {t("reviews.list.verifiedPurchase")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: t("reviews.list.columns.status"),
      sortable: true,
      render: (v) => {
        const s = statusStyle[v as ReviewStatus];

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              s.text,
              s.bg
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
            {t(`common.status.${v as string}`, v as string)}
          </span>
        );
      },
    },
    { key: "createdAt", header: t("reviews.list.columns.date"), sortable: true },
  ];

  const reviewRowActions: RowAction<Review>[] = [
    {
      label: t("common.actions.approve"),
      icon: CheckCircle2,
      onClick: approve,
      hidden: (r) => r.status !== "pending",
    },
    {
      label: t("common.actions.reject"),
      icon: XCircle,
      variant: "destructive",
      onClick: reject,
      hidden: (r) => r.status !== "pending",
    },
    {
      label: t("common.actions.edit"),
      icon: Pencil,
      onClick: openEditDialog,
    },
    {
      label: t("common.actions.delete"),
      icon: Trash2,
      variant: "destructive",
      onClick: (r) => setPendingAction({ type: "delete", review: r }),
    },
  ];

  const reviewToolbarActions: ToolbarAction<Review>[] = [
    {
      label: t("common.actions.deleteSelected"),
      icon: Trash2,
      variant: "destructive",
      requiresSelection: true,
      onClick: (rows) => setPendingAction({ type: "deleteSelected", reviews: rows }),
    },
    {
      label: t("reviews.list.addReview"),
      icon: Plus,
      variant: "default",
      requiresSelection: false,
      onClick: openAddDialog,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("reviews.topbarTitle")}>
      <DataTable<Review>
        title={t("reviews.list.title")}
        description={t("reviews.list.description")}
        data={reviewList}
        columns={reviewColumns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("reviews.list.searchPlaceholder")}
        searchKeys={["titleEn", "commentEn"]}
        filters={[
          {
            key: "status",
            label: t("reviews.list.filterStatus"),
            options: [
              { label: t("common.status.pending"), value: "pending" },
              { label: t("common.status.approved"), value: "approved" },
              { label: t("common.status.rejected"), value: "rejected" },
            ],
          },
          {
            key: "rating",
            label: t("reviews.list.filterRating"),
            options: [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) })),
          },
        ]}
        selectable
        rowActions={reviewRowActions}
        rowActionsVariant="inline"
        toolbarActions={reviewToolbarActions}
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("reviews.list.stats.total"),
            value: reviewList.length,
            icon: MessageSquare,
            variant: "primary",
          },
          {
            title: t("reviews.list.stats.pending"),
            value: pendingCount,
            icon: Clock,
            variant: "warning",
          },
          {
            title: t("reviews.list.stats.approved"),
            value: approvedCount,
            icon: CheckCircle2,
            variant: "success",
          },
          {
            title: t("reviews.list.stats.avgRating"),
            value: avgRating,
            icon: Star,
            variant: "info",
          },
        ]}
        emptyState={{
          title: t("reviews.list.emptyTitle"),
          description: t("reviews.list.emptyDescription"),
        }}
      />

      <ReviewFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        review={editingReview}
        productOptions={productOptions}
        orderOptions={orderOptions}
        userOptions={userOptions}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        variant="destructive"
        title={
          pendingAction?.type === "delete"
            ? t("reviews.list.confirm.deleteTitle")
            : pendingAction?.type === "deleteSelected"
              ? t("reviews.list.confirm.deleteSelectedTitle", {
                  count: pendingAction.reviews.length,
                })
              : ""
        }
        description={
          pendingAction?.type === "delete"
            ? t("reviews.list.confirm.deleteDescription", { title: pendingAction.review.titleEn })
            : pendingAction?.type === "deleteSelected"
              ? t("reviews.list.confirm.deleteSelectedDescription")
              : undefined
        }
        confirmLabel={
          pendingAction?.type === "delete"
            ? t("common.actions.delete")
            : pendingAction?.type === "deleteSelected"
              ? t("common.actions.deleteSelected")
              : undefined
        }
        onConfirm={confirmPendingAction}
      />
    </DashboardLayout>
  );
}
