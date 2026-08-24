// A submitted review starts 'pending' and only counts toward a product's/
// vendor's public rating aggregate once an admin moves it to 'approved' —
// see ReviewsService.moderate and *.recomputeAggregates.
export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
