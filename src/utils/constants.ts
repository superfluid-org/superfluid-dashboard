// To keep references to empty arrays consistent
export const EMPTY_ARRAY = Object.freeze([]) as []; // THIS ARRAY IS NOT MEANT TO BE MUTATED

export const ACL_CREATE_PERMISSION = 1;
export const ACL_UPDATE_PERMISSION = 2;
export const ACL_DELETE_PERMISSION = 4;

/** Where allowlist-gated features (vesting, stream scheduling, auto-wrap) send users to request access. */
export const ALLOWLIST_CONTACT_URL = "https://superfluid.org/contact";