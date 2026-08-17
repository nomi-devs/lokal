// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Shape mirrors the REVIEWS collection in the ERD.
export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: number;
  productId: number;
  orderId: number;
  userId: number;
  rating: number;
  titleEn: string;
  titleAr: string;
  commentEn: string;
  commentAr: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
};

export const reviews: Review[] = [
  {
    id: 1,
    productId: 1,
    orderId: 1,
    userId: 2,
    rating: 5,
    titleEn: "Excellent quality",
    titleAr: "جودة ممتازة",
    commentEn: "Very comfortable and arrived on time.",
    commentAr: "مريحة جدًا ووصلت في الوقت المحدد.",
    images: [],
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: "2026-08-07",
    updatedAt: "2026-08-08",
    approvedAt: "2026-08-08",
  },
  {
    id: 2,
    productId: 9,
    orderId: 1,
    userId: 2,
    rating: 4,
    titleEn: "Nice fabric",
    titleAr: "قماش جميل",
    commentEn: "Good color match, slightly thinner than expected.",
    commentAr: "لون مطابق جيد، لكنه أرق قليلاً من المتوقع.",
    images: [],
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: "2026-08-07",
    updatedAt: "2026-08-08",
    approvedAt: "2026-08-08",
  },
  {
    id: 3,
    productId: 2,
    orderId: 2,
    userId: 13,
    rating: 5,
    titleEn: "Sturdy and beautiful",
    titleAr: "متينة وجميلة",
    commentEn: "Solid oak, exactly as described.",
    commentAr: "خشب بلوط صلب، مطابقة تمامًا للوصف.",
    images: [],
    isVerifiedPurchase: true,
    status: "pending",
    createdAt: "2026-08-09",
    updatedAt: "2026-08-09",
  },
  {
    id: 4,
    productId: 4,
    orderId: 3,
    userId: 11,
    rating: 3,
    titleEn: "Works but leaks slightly",
    titleAr: "يعمل لكن به تسريب بسيط",
    commentEn: "Installation was easy but there's a minor drip.",
    commentAr: "التركيب سهل لكن يوجد تسريب بسيط.",
    images: [],
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: "2026-08-11",
    updatedAt: "2026-08-12",
    approvedAt: "2026-08-12",
  },
  {
    id: 5,
    productId: 7,
    orderId: 5,
    userId: 7,
    rating: 5,
    titleEn: "Cools the room fast",
    titleAr: "تبريد سريع للغرفة",
    commentEn: "Quiet operation and very efficient.",
    commentAr: "تشغيل هادئ وكفاءة عالية.",
    images: [],
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: "2026-08-02",
    updatedAt: "2026-08-03",
    approvedAt: "2026-08-03",
  },
  {
    id: 6,
    productId: 3,
    orderId: 6,
    userId: 4,
    rating: 2,
    titleEn: "Color looked different",
    titleAr: "اللون مختلف عن الصورة",
    commentEn: "Wall paint dried a shade darker than shown.",
    commentAr: "جف الدهان بدرجة أغمق مما هو موضح.",
    images: [],
    isVerifiedPurchase: true,
    status: "rejected",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-25",
  },
  {
    id: 7,
    productId: 8,
    orderId: 8,
    userId: 11,
    rating: 4,
    titleEn: "Good value",
    titleAr: "قيمة جيدة",
    commentEn: "Straight rebar, no rust, fast delivery.",
    commentAr: "حديد مستقيم بدون صدأ وتوصيل سريع.",
    images: [],
    isVerifiedPurchase: true,
    status: "pending",
    createdAt: "2026-08-16",
    updatedAt: "2026-08-16",
  },
];
