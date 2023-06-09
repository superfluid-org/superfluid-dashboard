import Decimal from "decimal.js";
import { BigNumberish, utils } from "ethers";
import { FC, memo, PropsWithChildren } from "react";
import { Currency } from "../../utils/currencyUtils";
import { useAppCurrency } from "../settings/appSettingsHooks";

interface FiatAmountProps {
  wei: BigNumberish | undefined;
  decimals?: number;
  price: number;
}

const FiatAmount: FC<PropsWithChildren<FiatAmountProps>> = ({
  wei = 0,
  decimals = 18,
  price,
  children,
}) => {
  const currency = useAppCurrency();
  const decimal = new Decimal(utils.formatUnits(wei, decimals)).mul(price);

  return (
    <>
      {currency.format(decimal.toFixed(2))}
      {children}
    </>
  );
};

export default memo(FiatAmount);
