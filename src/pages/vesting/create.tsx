import { Card } from "@mui/material";
import { ReactElement } from "react";
import ConnectionBoundary from "../../features/transactionBoundary/ConnectionBoundary";
import CreateVestingFormProvider from "../../features/vesting/CreateVestingFormProvider";
import { CreateVestingSection } from "../../features/vesting/CreateVestingSection";
import { VestingLayout } from "../../features/vesting/VestingLayout";
import { NextPageWithLayout } from "../_app";

const CreateVestingSchedulePage: NextPageWithLayout = () => {
  return (
    <Card>
      <ConnectionBoundary>
        <CreateVestingFormProvider>
          <CreateVestingSection />
        </CreateVestingFormProvider>
      </ConnectionBoundary>
    </Card>
  );
};

CreateVestingSchedulePage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default CreateVestingSchedulePage;
