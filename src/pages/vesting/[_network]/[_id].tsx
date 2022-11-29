import { isString } from "lodash";
import { useRouter } from "next/router";
import {
  ReactElement,
  useEffect,
  useState,
} from "react";
import { Network, networksBySlug } from "../../../features/network/networks";
import { VestingScheduleDetails } from "../../../features/vesting/VestingScheduleDetailsSection";
import { VestingScheduleDetailsLayout } from "../../../features/vesting/VestingScheduleDetailsLayout";
import Page404 from "../../404";
import { NextPageWithLayout } from "../../_app";
import { BigLoader } from "../../../features/vesting/BigLoader";

const VestingScheduleDetailsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const [routeHandled, setRouteHandled] = useState(false);

  const [network, setNetwork] = useState<Network | undefined>();
  const [vestingScheduleId, setVestingScheduleId] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (router.isReady) {
      setNetwork(
        networksBySlug.get(
          isString(router.query._network) ? router.query._network : ""
        )
      );
      setVestingScheduleId(
        isString(router.query._id) ? router.query._id : undefined
      );
      setRouteHandled(true);
    }
  }, [setRouteHandled, router.isReady, router.query._token]);

  const isPageReady = routeHandled;
  if (!isPageReady) {
    return <BigLoader />;
  }

  if (!network || !vestingScheduleId) {
    return <Page404 />;
  }

  return <VestingScheduleDetails network={network} id={vestingScheduleId} />;
};

VestingScheduleDetailsPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingScheduleDetailsLayout>{page}</VestingScheduleDetailsLayout>;
};

export default VestingScheduleDetailsPage;
