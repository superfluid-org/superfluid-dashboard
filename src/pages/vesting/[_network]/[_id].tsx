import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { Network, networksBySlug } from "../../../features/network/networks";
import { VestingLayout } from "../../../features/vesting/VestingLayout";
import { VestingScheduleDetails } from "../../../features/vesting/VestingScheduleDetails";
import Page404 from "../../404";
import { NextPageWithLayout } from "../../_app";

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
    return <>TODO</>;
  }

  if (!network || !vestingScheduleId) {
    return <Page404 />;
  }

  return <VestingScheduleDetails network={network} id={vestingScheduleId} />;
};

VestingScheduleDetailsPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default VestingScheduleDetailsPage;
