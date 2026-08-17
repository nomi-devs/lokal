// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Shape mirrors the CONTENT collection in the ERD (type: "banner").
export type ContentType = "banner" | "faq" | "about" | "contact";
export type BannerPosition = "Home Top" | "Home Middle" | "Category Page" | "Checkout";

export type Banner = {
  id: number;
  type: ContentType;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  image: string;
  url: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Banner-specific extras beyond the base CONTENT entity
  position: BannerPosition;
  startDate?: string;
  endDate?: string;
  clicks: number;
};

export const banners: Banner[] = [
  {
    id: 1,
    type: "banner",
    titleEn: "Summer Sale — Up to 40% Off",
    titleAr: "تخفيضات الصيف — خصم حتى 40%",
    image: "https://picsum.photos/seed/banner1/120/60",
    url: "/promo/summer-sale",
    position: "Home Top",
    isActive: true,
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    clicks: 4820,
    order: 1,
    createdAt: "2026-05-20",
    updatedAt: "2026-06-01",
  },
  {
    id: 2,
    type: "banner",
    titleEn: "New Vendor Onboarding",
    titleAr: "انضمام موردين جدد",
    image: "https://picsum.photos/seed/banner2/120/60",
    url: "/vendors/join",
    position: "Home Middle",
    isActive: true,
    startDate: "2026-05-15",
    endDate: "2026-12-31",
    clicks: 1290,
    order: 2,
    createdAt: "2026-05-01",
    updatedAt: "2026-05-15",
  },
  {
    id: 3,
    type: "banner",
    titleEn: "Free Shipping Weekend",
    titleAr: "شحن مجاني نهاية الأسبوع",
    image: "https://picsum.photos/seed/banner3/120/60",
    url: "/promo/free-shipping",
    position: "Checkout",
    isActive: true,
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    clicks: 0,
    order: 3,
    createdAt: "2026-08-10",
    updatedAt: "2026-08-10",
  },
  {
    id: 4,
    type: "banner",
    titleEn: "Home & Garden Category Spotlight",
    titleAr: "أبرز فئة المنزل والحديقة",
    image: "https://picsum.photos/seed/banner4/120/60",
    url: "/categories/home-garden",
    position: "Category Page",
    isActive: true,
    startDate: "2026-04-01",
    endDate: "2026-10-01",
    clicks: 2765,
    order: 4,
    createdAt: "2026-03-25",
    updatedAt: "2026-04-01",
  },
  {
    id: 5,
    type: "banner",
    titleEn: "Winter Clearance",
    titleAr: "تصفية الشتاء",
    image: "https://picsum.photos/seed/banner5/120/60",
    url: "/promo/winter-clearance",
    position: "Home Top",
    isActive: false,
    startDate: "2025-12-01",
    endDate: "2026-01-31",
    clicks: 9310,
    order: 5,
    createdAt: "2025-11-20",
    updatedAt: "2026-02-01",
  },
  {
    id: 6,
    type: "banner",
    titleEn: "Refer a Friend Program",
    titleAr: "برنامج ادعُ صديقًا",
    image: "https://picsum.photos/seed/banner6/120/60",
    url: "/referrals",
    position: "Home Middle",
    isActive: true,
    startDate: "2026-03-01",
    endDate: "2026-12-31",
    clicks: 3157,
    order: 6,
    createdAt: "2026-02-15",
    updatedAt: "2026-03-01",
  },
];
