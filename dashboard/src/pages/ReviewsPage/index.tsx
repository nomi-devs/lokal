import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, MessageSquare, Clock, CheckCircle2, ShieldCheck, CheckCheck, XCircle } from "lucide-react";

import RejectReviewDialog from "./RejectReviewDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  listAdminReviews,
  approveReview,
  rejectReview,
  type AdminReview,
  type ReviewStatus,
} from "@/lib/reviewsApi";

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

// DataTable's search matches `String(row[key])` directly — a nested
// { en, ar? } object would search-match as the literal string
// "[object Object]", so title/comment are flattened onto the row here.
type ReviewRow = AdminReview & { titleText: string; commentText: string };

function toRow(review: AdminReview): ReviewRow {
  return { ...review, titleText: review.title.en, commentText: review.comment.en };
}

// ── Page ──────────────────────────────────────────────────────────────────────
// Moderation queue only — reviews are customer-submitted from the mobile app
// (POST /me/reviews after a delivered order), not admin-authored, so unlike
// the old mock there's no add/edit dialog here, only approve/reject. A
// review only counts toward its product's/vendor's public rating once
// approved (see local-be's ReviewsService.recomputeAggregates — the rating
// itself is recomputed server-side, so this page never touches it directly).
export default function ReviewsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reviewList, setReviewList] = useState<AdminReview[]>([]);
  const [rejectTarget, setRejectTarget] = useState<AdminReview | null>(null);
  const rows = reviewList.map(toRow);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminReviews();
      setReviewList(res.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load reviews"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const pendingCount = reviewList.filter((r) => r.status === "pending").length;
  const approvedCount = reviewList.filter((r) => r.status === "approved").length;

  const avgRating = reviewList.length
    ? (reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length).toFixed(1)
    : "0.0";

  async function approve(review: AdminReview) {
    try {
      const updated = await approveReview(review.id);
      setReviewList((prev) => prev.map((r) => (r.id === review.id ? updated : r)));
      toast.success(t("reviews.list.toasts.approved", "Review approved"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function reject(reviewId: string, rejectionReason: string) {
    try {
      const updated = await rejectReview(reviewId, rejectionReason);
      setReviewList((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      toast.success(t("reviews.list.toasts.rejected", "Review rejected"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const columns: ColumnDef<ReviewRow>[] = [
    {
      key: "title",
      header: t("reviews.list.columns.review", "Review"),
      render: (_, row) => (
        <div className="min-w-0 max-w-[280px]">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{row.title.en}</p>
            {row.isVerifiedPurchase && (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{row.comment.en}</p>
        </div>
      ),
    },
    {
      key: "rating",
      header: t("reviews.list.columns.rating", "Rating"),
      sortable: true,
      render: (v) => <RatingStars rating={v as number} />,
    },
    {
      key: "status",
      header: t("reviews.list.columns.status", "Status"),
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
    {
      key: "createdAt",
      header: t("reviews.list.columns.date", "Date"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  const rowActions: RowAction<ReviewRow>[] = [
    {
      label: t("common.actions.approve", "Approve"),
      icon: CheckCheck,
      onClick: approve,
      hidden: (r) => r.status !== "pending",
    },
    {
      label: t("reviews.reject", "Reject"),
      icon: XCircle,
      variant: "destructive",
      onClick: (r) => setRejectTarget(r),
      hidden: (r) => r.status !== "pending",
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("reviews.list.topbarTitle")}>
      <DataTable<ReviewRow>
        title={t("reviews.list.title")}
        description={t("reviews.list.description")}
        data={rows}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("reviews.list.searchPlaceholder", "Search reviews…")}
        searchKeys={["titleText", "commentText"]}
        filters={[
          {
            key: "status",
            label: t("reviews.list.filterStatus", "Status"),
            options: [
              { label: t("common.status.pending"), value: "pending" },
              { label: t("common.status.approved"), value: "approved" },
              { label: t("common.status.rejected"), value: "rejected" },
            ],
          },
        ]}
        rowActions={rowActions}
        rowActionsVariant="inline"
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("reviews.list.stats.total", "Total Reviews"),
            value: reviewList.length,
            icon: MessageSquare,
            variant: "primary",
          },
          {
            title: t("reviews.list.stats.pending", "Pending"),
            value: pendingCount,
            icon: Clock,
            variant: "warning",
          },
          {
            title: t("reviews.list.stats.approved", "Approved"),
            value: approvedCount,
            icon: CheckCircle2,
            variant: "success",
          },
          {
            title: t("reviews.list.stats.avgRating", "Average Rating"),
            value: avgRating,
            icon: Star,
            variant: "info",
          },
        ]}
        emptyState={{
          title: t("reviews.list.emptyTitle", "No reviews yet"),
          description: t(
            "reviews.list.emptyDescription",
            "Customer reviews will appear here once submitted."
          ),
        }}
      />

      <RejectReviewDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        review={rejectTarget}
        onConfirm={reject}
      />
    </DashboardLayout>
  );
}
