import { Card } from "@mui/material";
import { ReactElement } from "react";
import CreateVestingFormProvider from "../../features/vesting/CreateVestingFormProvider";
import { CreateVestingSection } from "../../features/vesting/CreateVestingSection";
import { VestingLayout } from "../../features/vesting/VestingLayout";
import { NextPageWithLayout } from "../_app";

const CreateVestingSchedulePage: NextPageWithLayout = () => {
  return (
    <Card>
      <CreateVestingFormProvider>
        <CreateVestingSection />
      </CreateVestingFormProvider>
    </Card>
  );
};

CreateVestingSchedulePage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default CreateVestingSchedulePage;
