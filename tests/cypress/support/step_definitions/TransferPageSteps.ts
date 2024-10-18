import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { TransferPage } from '../../pageObjects/pages/TransferPage';

Given(
  /^User fills all transfer inputs "([^"]*)" a wallet connected$/,
  (isConnected: string) => {
    TransferPage.inputTransferTestData(isConnected);
  }
);
