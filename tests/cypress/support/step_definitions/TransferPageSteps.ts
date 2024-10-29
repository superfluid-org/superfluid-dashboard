import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { TransferPage } from '../../pageObjects/pages/TransferPage';
import { Common } from '../../pageObjects/pages/Common';

Given(
  /^User fills all transfer inputs "([^"]*)" a wallet connected$/,
  (isConnected: string) => {
    TransferPage.inputTransferTestData(isConnected);
  }
);

Then(/^User clicks on the wrap button in the transfer page$/, () => {
  TransferPage.clickBalancePreviewWrapButton();
});

Then(
  /^Token balance is shown correctly in the transfer page with a wrap button next to it$/,
  () => {
    TransferPage.validateTransferPagePreviewBalance();
  }
);

Given(
  /^User inputs all the details to send "([^"]*)" "([^"]*)" to "([^"]*)"$/,
  (amount: string, token: string, address: string) => {
    TransferPage.inputTransferDetails(amount, token, address);
  }
);

Given(
  /^User sends the transfer and the transaction dialogs are visible for "([^"]*)"$/,
  (network: string) => {
    TransferPage.clickTransferButton();
    TransferPage.validateTransferTxMessage(network);
    TransferPage.validateBroadcastedTransactionTxMessage();
    TransferPage.clickOkButton();
  }
);

Given(
  /^The first row does not have a pending transfer transaction status$/,
  () => {
    TransferPage.validateNoPendingStatusForFirstTransferRow();
  }
);

Then(
  /^All the details to send "([^"]*)" "([^"]*)" to "([^"]*)" on "([^"]*)" are set in the fields$/,
  (amount: string, token: string, address: string, network: string) => {
    TransferPage.validateRestoredTransferTransaction(
      amount,
      token,
      address,
      network
    );
  }
);

Then(
  /^Transfer button is enabled and asks user to Connect their wallet$/,
  () => {
    Common.checkConnectWalletButton();
  }
);

Then(/^Validate "([^"]*)" error$/, (error: string) => {
  TransferPage.validateFormError(error);
});
