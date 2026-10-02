/** Status options for a People's Record entry (also enforced by a DB check constraint). */
export const PERSON_STATUSES = ["Pending", "Cleared"] as const;
export type PersonStatus = (typeof PERSON_STATUSES)[number];
