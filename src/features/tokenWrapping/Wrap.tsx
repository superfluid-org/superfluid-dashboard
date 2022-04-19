import { FC, useEffect, useState } from "react";
import {
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { Card, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useRouter } from "next/router";
import { WrapUpgrade } from "./WrapUpgrade";
import { WrapDowngrade } from "./WrapDowngrade";
import { useTransactionRestorationContext } from "../transactionRestoration/TransactionRestorationContext";

export const Wrap: FC<{
  tabValue: "upgrade" | "downgrade";
}> = ({ tabValue }) => {
  const router = useRouter();

  const { transactionToRestore, onRestored } =
    useTransactionRestorationContext();

  const [upgradeRecovery, setUpgradeRecovery] = useState<
    SuperTokenUpgradeRestoration | undefined
  >();

  const [downgradeRecovery, setDowngradeRecovery] = useState<
    SuperTokenDowngradeRestoration | undefined
  >();

  useEffect(() => {
    if (transactionToRestore) {
      switch (transactionToRestore.title) {
        case "Upgrade to Super Token":
          setUpgradeRecovery(
            transactionToRestore.extraData
              .restore as SuperTokenUpgradeRestoration
          );
          break;
        case "Downgrade from Super Token":
          setDowngradeRecovery(
            transactionToRestore.extraData
              .restore as SuperTokenDowngradeRestoration
          );
          break;
      }
    }
    onRestored();
  }, [
    setUpgradeRecovery,
    setDowngradeRecovery,
    transactionToRestore,
    onRestored,
  ]);

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
          <Tab data-cy={"indexes-tab"} label="Downgrade" value="downgrade" />+
        </TabList>

        <TabPanel value="upgrade">
          <WrapUpgrade transactionRestoration={upgradeRecovery}></WrapUpgrade>
        </TabPanel>

        <TabPanel value="downgrade">
          <WrapDowngrade
            transactionRestoration={downgradeRecovery}
          ></WrapDowngrade>
        </TabPanel>
      </TabContext>
    </Card>
  );
};
