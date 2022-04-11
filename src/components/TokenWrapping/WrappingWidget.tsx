import {FC, useEffect, useState} from "react";
import {SuperTokenDowngradeRecovery, SuperTokenUpgradeRecovery,} from "../../redux/transactionRecoveries";
import {Card, Tab,} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {useRouter} from "next/router";
import {useTransactionContext} from "../TransactionDrawer/TransactionContext";
import {UpgradePanel} from "./UpgradePanel";
import {DowgradePanel} from "./DowgradePanel";

export const WrappingWidget: FC<{
  tabValue: "upgrade" | "downgrade";
}> = ({ tabValue }) => {
  const router = useRouter();

  const { transactionToRecover, transactionRecovery, setTransactionToRecover } =
    useTransactionContext();

  const [upgradeRecovery, setUpgradeRecovery] = useState<
    SuperTokenUpgradeRecovery | undefined
  >();

  const [downgradeRecovery, setDowngradeRecovery] = useState<
    SuperTokenDowngradeRecovery | undefined
  >();

  useEffect(() => {
    if (transactionToRecover) {
      switch (transactionToRecover.title) {
        case "Upgrade to Super Token":
          setUpgradeRecovery(transactionRecovery as SuperTokenUpgradeRecovery);
          break;
        case "Downgrade from Super Token":
          setDowngradeRecovery(
            transactionRecovery as SuperTokenDowngradeRecovery
          );
          break;
      }
    }
    setTransactionToRecover(undefined);
  }, []);

  return (
    <Card
      sx={{ position: "fixed", top: "25%", width: "400px", p: 5 }}
      elevation={6}
    >
      <TabContext value={tabValue}>
        <TabList
          variant="scrollable"
          scrollButtons="auto"
          onChange={(_event, newValue: "upgrade" | "downgrade") =>
            router.replace(`/${newValue}`)
          }
          aria-label="tabs"
        >
          <Tab data-cy={"streams-tab"} label="Upgrade" value="upgrade" />
          <Tab data-cy={"indexes-tab"} label="Downgrade" value="downgrade" />
        </TabList>

        <TabPanel value="upgrade">
          <UpgradePanel transactionRecovery={upgradeRecovery}></UpgradePanel>
        </TabPanel>

        <TabPanel value="downgrade">
          <DowgradePanel
            transactionRecovery={downgradeRecovery}
          ></DowgradePanel>
        </TabPanel>
      </TabContext>
    </Card>
  );
};
