// Which @ApiTags() values appear on each of the two Swagger UIs (see
// common/swagger/filter-document-by-tags.util.ts and main.ts). Mobile and
// dashboard auth are now fully separate controllers/URLs (/mobile/auth/*,
// /dashboard/auth/*) with no shared routes, so each tag only needs to
// appear in one list.
export const MOBILE_API_TAGS = [
  'Auth - Mobile',
  'Users',
  'Files',
  'Categories',
  'Products',
  'Stores',
  'Addresses',
  'Wishlist',
  'Cart',
  'Orders',
  'Payments',
  'FAQ',
  'Banners',
  'Notifications',
  'Reviews',
  'Refunds',
];

export const DASHBOARD_API_TAGS = [
  'Auth - Dashboard',
  'Vendors',
  'Files',
  'Categories',
  'Admin - Users',
  'Admin - Vendors',
  'Admin - Categories',
  'Admin - Products',
  'Admin - Dashboard',
  'Admin - Orders',
  'Admin - FAQ',
  'Admin - Banners',
  'Vendor - Products',
  'Vendor - Orders',
  'Notifications',
  'Admin - Notifications',
  'Admin - Reviews',
  'Admin - Payments',
  'Admin - Promo Codes',
  'Admin - Refunds',
  'Admin - Settings',
  'Commission',
];
