import { Stream } from "@superfluid-finance/sdk-core";

export interface StreamScheduling {
  startDate: Date;
  startDateScheduled: Date | undefined;
  endDate: Date | undefined;
  endDateScheduled: Date | undefined;
}

export interface ScheduledStream extends Stream, StreamScheduling {
    // isActive: boolean; // TODO(KK): Maybe map this already in the SDK?
}
