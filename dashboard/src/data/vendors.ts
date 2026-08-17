// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Shape mirrors the VENDORS collection in the ERD.
export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";
export type CommissionType = "percentage" | "fixed";

export type VendorDocument = { type: string; url: string; uploadedAt: string };

export type Vendor = {
  id: number;
  nameEn: string;
  nameAr: string;
  logoUrl?: string;
  email: string;
  phone: string;
  businessLicense?: string;
  taxId?: string;
  bankAccount?: { accountHolder: string; accountNumber: string; bankName: string };
  status: VendorStatus;
  commission: { type: CommissionType; value: number };
  documents: VendorDocument[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  // Admin-list display extras (not part of the core ERD entity)
  ownerName: string;
  category: string;
  city: string;
  rating: number | null;
};

const doc = (type: string, uploadedAt: string): VendorDocument => ({
  type,
  url: `/documents/${type.toLowerCase().replace(/\s+/g, "-")}.pdf`,
  uploadedAt,
});

export const initialVendors: Vendor[] = [
  {
    id: 1,
    nameEn: "BuildRight Contractors",
    nameAr: "بيلد رايت للمقاولات",
    ownerName: "Yousef Al-Sabah",
    email: "yousef@buildright.com",
    phone: "+96560001122",
    category: "Construction",
    city: "Kuwait City",
    status: "pending",
    commission: { type: "percentage", value: 12 },
    documents: [
      doc("License", "2026-08-09"),
      doc("Tax ID", "2026-08-09"),
      doc("Insurance", "2026-08-10"),
      doc("ID Copy", "2026-08-10"),
    ],
    createdAt: "2026-08-10",
    updatedAt: "2026-08-10",
    rating: null,
  },
  {
    id: 2,
    nameEn: "Bright Spark Electric",
    nameAr: "برايت سبارك للكهرباء",
    ownerName: "Fatima Noor",
    email: "fatima@brightspark.com",
    phone: "+96560003344",
    category: "Electricity",
    city: "Hawalli",
    status: "pending",
    commission: { type: "percentage", value: 10 },
    documents: [
      doc("License", "2026-08-11"),
      doc("Tax ID", "2026-08-12"),
      doc("ID Copy", "2026-08-12"),
    ],
    createdAt: "2026-08-12",
    updatedAt: "2026-08-12",
    rating: null,
  },
  {
    id: 3,
    nameEn: "GreenScape Landscaping",
    nameAr: "جرين سكيب لتنسيق الحدائق",
    ownerName: "Ahmad Rahal",
    email: "ahmad@greenscape.com",
    phone: "+96560005566",
    category: "Landscaping",
    city: "Salmiya",
    status: "pending",
    commission: { type: "percentage", value: 10 },
    documents: [doc("License", "2026-08-13"), doc("ID Copy", "2026-08-14")],
    createdAt: "2026-08-14",
    updatedAt: "2026-08-14",
    rating: null,
  },
  {
    id: 4,
    nameEn: "PureFlow Plumbing",
    nameAr: "بيور فلو للسباكة",
    ownerName: "Nadia Hassan",
    email: "nadia@pureflow.com",
    phone: "+96560007788",
    category: "Plumbing",
    city: "Farwaniya",
    status: "pending",
    commission: { type: "fixed", value: 15 },
    documents: [
      doc("License", "2026-08-14"),
      doc("Tax ID", "2026-08-14"),
      doc("Insurance", "2026-08-15"),
      doc("ID Copy", "2026-08-15"),
      doc("Bank Letter", "2026-08-15"),
    ],
    createdAt: "2026-08-15",
    updatedAt: "2026-08-15",
    rating: null,
  },
  {
    id: 5,
    nameEn: "Studio Line Interiors",
    nameAr: "ستوديو لاين للتصميم الداخلي",
    ownerName: "Omar Nasser",
    email: "omar@studioline.com",
    phone: "+96560009900",
    category: "Design & Architecture",
    city: "Kuwait City",
    status: "approved",
    commission: { type: "percentage", value: 15 },
    documents: [
      doc("License", "2026-06-20"),
      doc("Tax ID", "2026-06-20"),
      doc("Insurance", "2026-06-21"),
      doc("ID Copy", "2026-06-21"),
      doc("Bank Letter", "2026-06-22"),
      doc("Portfolio", "2026-06-22"),
    ],
    createdAt: "2026-07-02",
    updatedAt: "2026-07-05",
    approvedAt: "2026-07-05",
    rating: 4.8,
  },
  {
    id: 6,
    nameEn: "CoolAir HVAC Services",
    nameAr: "كول اير لخدمات التكييف",
    ownerName: "Layla Mansour",
    email: "layla@coolair.com",
    phone: "+96560011234",
    category: "HVAC",
    city: "Jahra",
    status: "approved",
    commission: { type: "percentage", value: 12 },
    documents: [
      doc("License", "2026-06-10"),
      doc("Tax ID", "2026-06-10"),
      doc("ID Copy", "2026-06-11"),
      doc("Bank Letter", "2026-06-11"),
    ],
    createdAt: "2026-06-18",
    updatedAt: "2026-06-25",
    approvedAt: "2026-06-25",
    rating: 4.5,
  },
  {
    id: 7,
    nameEn: "ColorCraft Painters",
    nameAr: "كولور كرافت للدهانات",
    ownerName: "Khalid Sultan",
    email: "khalid@colorcraft.com",
    phone: "+96560015678",
    category: "Interior Painting",
    city: "Salmiya",
    status: "approved",
    commission: { type: "fixed", value: 10 },
    documents: [
      doc("License", "2026-05-18"),
      doc("ID Copy", "2026-05-19"),
      doc("Bank Letter", "2026-05-19"),
    ],
    createdAt: "2026-05-25",
    updatedAt: "2026-05-30",
    approvedAt: "2026-05-30",
    rating: 4.2,
  },
  {
    id: 8,
    nameEn: "SafeWire Electrical Co.",
    nameAr: "سيف واير للكهرباء",
    ownerName: "Huda Aziz",
    email: "huda@safewire.com",
    phone: "+96560019012",
    category: "Electricity",
    city: "Hawalli",
    status: "suspended",
    commission: { type: "percentage", value: 10 },
    documents: [
      doc("License", "2026-04-22"),
      doc("Tax ID", "2026-04-23"),
      doc("ID Copy", "2026-04-23"),
      doc("Bank Letter", "2026-04-24"),
    ],
    createdAt: "2026-04-30",
    updatedAt: "2026-07-01",
    approvedAt: "2026-05-05",
    rating: 3.6,
  },
  {
    id: 9,
    nameEn: "QuickFix Plumbing",
    nameAr: "كويك فيكس للسباكة",
    ownerName: "Bader Salem",
    email: "bader@quickfix.com",
    phone: "+96560023456",
    category: "Plumbing",
    city: "Farwaniya",
    status: "rejected",
    commission: { type: "percentage", value: 10 },
    documents: [doc("License", "2026-07-19")],
    createdAt: "2026-07-20",
    updatedAt: "2026-07-22",
    rating: null,
  },
  {
    id: 10,
    nameEn: "Urban Build Group",
    nameAr: "أوربان بيلد جروب",
    ownerName: "Mariam Fahad",
    email: "mariam@urbanbuild.com",
    phone: "+96560027890",
    category: "Construction",
    city: "Ahmadi",
    status: "approved",
    commission: { type: "percentage", value: 14 },
    documents: [
      doc("License", "2026-03-01"),
      doc("Tax ID", "2026-03-02"),
      doc("Insurance", "2026-03-02"),
      doc("ID Copy", "2026-03-03"),
      doc("Bank Letter", "2026-03-03"),
      doc("Portfolio", "2026-03-04"),
      doc("Safety Cert", "2026-03-04"),
    ],
    createdAt: "2026-03-11",
    updatedAt: "2026-03-18",
    approvedAt: "2026-03-18",
    rating: 4.9,
  },
];
