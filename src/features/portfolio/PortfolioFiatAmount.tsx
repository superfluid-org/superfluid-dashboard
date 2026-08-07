import Decimal from "decimal.js";
import { BigNumberish, utils } from "ethers";
import { FC, memo, useMemo } from "react";
import { Currency } from "../../utils/currencyUtils";
import { useAppCurrency } from "../settings/appSettingsHooks";
import tokenPriceApi from "../tokenPrice/tokenPriceApi.slice";

interface PortfolioFiatAmountProps {
  balance: BigNumberish;
  decimals: number;
  priceUsd: number;
}

const PortfolioFiatAmount: FC<PortfolioFiatAmountProps> = ({
  balance,
  decimals,
  priceUsd,
}) => {
  const currency = useAppCurrency();
  const exchangeRates = tokenPriceApi.useGetUSDExchangeRateQuery();

  const formattedValue = useMemo(() => {
    const exchangeRate =
      currency === Currency.USD
        ? 1
        : exchangeRates.currentData?.[currency.toString()];
    if (!exchangeRate) return undefined;

    return currency.format(
      new Decimal(utils.formatUnits(balance, decimals))
        .mul(priceUsd)
        .mul(exchangeRate)
        .toFixed(2)
    );
  }, [balance, currency, decimals, exchangeRates.currentData, priceUsd]);

  return formattedValue ? (
    <span data-cy="fiat-amount">{formattedValue}</span>
  ) : null;
};

export default memo(PortfolioFiatAmount);
