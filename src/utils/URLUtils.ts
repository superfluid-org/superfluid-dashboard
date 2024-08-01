export function buildQueryString(queryObject: Object) {
  return Object.entries(queryObject)
    .map(([key, value]) =>
      value !== undefined && value !== null
        ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        : null
    )
    .filter((item) => item !== null)
    .join("&");
}

export const getWrapPagePath = ({
  network,
  token,
}: {
  network: string;
  token: string;
}) => `/wrap?network=${network}&token=${token}`;

export const getVestingPagePath = ({
  network,
  vestingScheduleId,
}: {
  network: string;
  vestingScheduleId: string;
}) => `/vesting/${network}/${vestingScheduleId}`;