// Which @ApiTags() values appear on each of the two Swagger UIs (see
// common/swagger/filter-document-by-tags.util.ts and main.ts). A tag present
// in both arrays (e.g. 'Files', 'Auth - Shared') shows up on both docs —
// that's intentional for endpoints genuinely used by both mobile and dashboard
// clients, not a mistake to dedupe.
export const MOBILE_API_TAGS = [
  'Auth - Mobile',
  'Auth - Shared',
  'Users',
  'Files',
];

export const DASHBOARD_API_TAGS = [
  'Auth - Dashboard',
  'Auth - Shared',
  'Vendors',
  'Files',
  'Admin - Users',
  'Admin - Vendors',
  'Admin - Dashboard',
];
