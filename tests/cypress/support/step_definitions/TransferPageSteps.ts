import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { TransferPage } from '../../pageObjects/pages/TransferPage';

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

Given(/^User clicks the send transfer button$/, function () {
  TransferPage.clickTransferButton();
});
