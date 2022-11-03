import Decimal from "decimal.js";
import { BigNumberish, utils } from "ethers";
import { FC, memo, PropsWithChildren } from "react";
import { useAppCurrency } from "../settings/appSettingsHooks";

interface FiatAmountProps {
  wei?: BigNumberish;
  price: number;
}

const FiatAmount: FC<PropsWithChildren<FiatAmountProps>> = ({
  wei = "1000000000000000000",
  price,
  children,
}) => {
  const currency = useAppCurrency();
  const decimal = new Decimal(utils.formatUnits(wei)).mul(price);

  return (
    <>
      {currency.format(decimal.toFixed(2))}
      {children}
    </>
  );
};

export default memo(FiatAmount);
