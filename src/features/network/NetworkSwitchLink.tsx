import Link from "@mui/material/Link";
import { FC, useCallback } from "react";
import { useSwitchChain } from "wagmi";
import { useAccount } from "@/hooks/useAccount"
import { useExpectedNetwork } from "./ExpectedNetworkContext";
import { Network } from "./networks";

interface NetworkSwitchLinkProps {
  network: Network;
  title?: string;
  disabled?: boolean;
}

const NetworkSwitchLink: FC<NetworkSwitchLinkProps> = ({
  network,
  title,
  disabled = false,
}) => {
  const { setExpectedNetwork } = useExpectedNetwork();
  const { address: accountAddress } = useAccount();
  const { switchChain } = useSwitchChain();

  const networkSwitchClicked = useCallback(() => {
    setExpectedNetwork(network.id);

    if (accountAddress && switchChain) {
      switchChain({ chainId: network.id });
    }
  }, [network, accountAddress, setExpectedNetwork, switchChain]);

  return (
    <Link
      data-cy={`${network.slugName}-link`}
      component="button"
      variant="body1"
      sx={{
        verticalAlign: "inherit",
        ...(disabled ? { cursor: "initial" } : {}),
      }}
      color={disabled ? "disabled" : "primary"}
      disabled={disabled}
      onClick={networkSwitchClicked}
    >
      {title || network.name}
    </Link>
  );
};

export default NetworkSwitchLink;
