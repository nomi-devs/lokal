// Which @ApiTags() values appear on each of the two Swagger UIs (see
// common/swagger/filter-document-by-tags.util.ts and main.ts). Mobile and
// dashboard auth are now fully separate controllers/URLs (/mobile/auth/*,
// /dashboard/auth/*) with no shared routes, so each tag only needs to
// appear in one list.
export const MOBILE_API_TAGS = ['Auth - Mobile', 'Users', 'Files'];

export const DASHBOARD_API_TAGS = [
  'Auth - Dashboard',
  'Vendors',
  'Files',
  'Admin - Users',
  'Admin - Vendors',
  'Admin - Dashboard',
];
