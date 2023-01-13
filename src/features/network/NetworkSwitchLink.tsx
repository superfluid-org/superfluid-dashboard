import Link from "@mui/material/Link";
import { FC, useCallback } from "react";
import { useAccount, useSwitchNetwork } from "wagmi";
import { useExpectedNetwork } from "./ExpectedNetworkContext";
import { Network } from "./networks";

interface NetworkSwitchLinkProps {
  network: Network;
  disabled?: boolean;
}

const NetworkSwitchLink: FC<NetworkSwitchLinkProps> = ({
  network,
  disabled = false,
}) => {
  const { setExpectedNetwork } = useExpectedNetwork();
  const { address: accountAddress } = useAccount();
  const { switchNetwork } = useSwitchNetwork();

  const networkSwitchClicked = useCallback(() => {
    setExpectedNetwork(network.id);

    if (accountAddress && switchNetwork) {
      switchNetwork(network.id);
    }
  }, [network, accountAddress, setExpectedNetwork, switchNetwork]);

  return (
    <Link
      component="button"
      sx={{ verticalAlign: "inherit" }}
      variant="body1"
      disabled={disabled}
      onClick={networkSwitchClicked}
    >
      {network.name}
    </Link>
  );
};

export default NetworkSwitchLink;
