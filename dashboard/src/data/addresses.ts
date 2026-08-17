// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Shape mirrors the ADDRESSES collection in the ERD.
export type AddressType = "home" | "office" | "other";

export type Address = {
  id: number;
  userId: number;
  type: AddressType;
  recipientName: string;
  country: string;
  city: string;
  phone: string;
  address: string;
  isPrimary: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export const addresses: Address[] = [
  {
    id: 1,
    userId: 2,
    type: "home",
    recipientName: "Bob Smith",
    country: "Kuwait",
    city: "Salmiya",
    phone: "+96560112233",
    address: "Block 4, Street 12, House 8",
    isPrimary: true,
    isDefault: true,
    createdAt: "2026-01-12",
    updatedAt: "2026-01-12",
  },
  {
    id: 2,
    userId: 2,
    type: "office",
    recipientName: "Bob Smith",
    country: "Kuwait",
    city: "Kuwait City",
    phone: "+96560112233",
    address: "Al Hamra Tower, Floor 32",
    isPrimary: false,
    isDefault: false,
    createdAt: "2026-02-03",
    updatedAt: "2026-02-03",
  },
  {
    id: 3,
    userId: 13,
    type: "home",
    recipientName: "Mia Thomas",
    country: "Kuwait",
    city: "Jabriya",
    phone: "+96560223344",
    address: "Villa 22, Block 9",
    isPrimary: true,
    isDefault: true,
    createdAt: "2026-03-15",
    updatedAt: "2026-03-15",
  },
  {
    id: 4,
    userId: 11,
    type: "home",
    recipientName: "Karen Moore",
    country: "Kuwait",
    city: "Farwaniya",
    phone: "+96560334455",
    address: "Block 1, Street 5, House 14",
    isPrimary: true,
    isDefault: true,
    createdAt: "2026-04-02",
    updatedAt: "2026-04-02",
  },
  {
    id: 5,
    userId: 11,
    type: "other",
    recipientName: "Karen Moore (Parents)",
    country: "Kuwait",
    city: "Ahmadi",
    phone: "+96560889900",
    address: "Plot 3, Industrial Area",
    isPrimary: false,
    isDefault: false,
    createdAt: "2026-05-20",
    updatedAt: "2026-05-20",
  },
  {
    id: 6,
    userId: 15,
    type: "home",
    recipientName: "Olivia Harris",
    country: "Kuwait",
    city: "Kuwait City",
    phone: "+96560445566",
    address: "Tower 3, Sharq, Apt 12B",
    isPrimary: true,
    isDefault: true,
    createdAt: "2026-05-30",
    updatedAt: "2026-05-30",
  },
  {
    id: 7,
    userId: 7,
    type: "home",
    recipientName: "Grace Kim",
    country: "Kuwait",
    city: "Mishref",
    phone: "+96560556677",
    address: "Villa 9, Block 3",
    isPrimary: true,
    isDefault: true,
    createdAt: "2026-06-11",
    updatedAt: "2026-06-11",
  },
  {
    id: 8,
    userId: 4,
    type: "home",
    recipientName: "David Brown",
    country: "Kuwait",
    city: "Hawalli",
    phone: "+96560667788",
    address: "Block 7, Street 21, House 5",
    isPrimary: true,
    isDefault: true,
    createdAt: "2026-06-25",
    updatedAt: "2026-06-25",
  },
];
