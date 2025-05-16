import { BasePage, wordTimeUnitMap } from '../BasePage';
import { networksBySlug } from '../../superData/networks';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { ProviderAdapter } from '@truffle/encoder';
import { http, createPublicClient } from 'viem';

export const TOP_BAR_NETWORK_BUTTON = '[data-cy=top-bar-network-button]';
export const CONNECTED_WALLET = '[data-cy=wallet-connection-status] h6';
export const WALLET_CONNECTION_STATUS = '[data-cy=wallet-connection-status] p';
export const NAVIGATION_MORE_BUTTON = '[data-cy=nav-more-button]';
export const ACCESS_CODE_BUTTON = '[data-cy=more-access-code-btn]';
export const ACCESS_CODE_INPUT = '[data-cy=access-code-input]';
export const ACCESS_CODE_SUBMIT = '[data-cy=submit-access-code]';
export const CONNECT_WALLET_BUTTON = '[data-cy=connect-wallet-button]';
export const TOKEN_ANIMATION = '[data-cy=animation]';
export const TOKEN_BALANCE = '[data-cy=token-balance]';
export const CHANGE_NETWORK_BUTTON = '[data-cy=change-network-button]';
export const DROPDOWN_BACKDROP = '[role=presentation]';
export const LIQUIDATED_OR_CANCEL_ICON = '[data-testid=CancelIcon]';
export const SELECT_TOKEN_BUTTON = '[data-cy=select-token-button]';
export const ADDRESS_BUTTON = '[data-cy=address-button]';
export const STOP_VIEWING_BUTTON = '[data-cy=view-mode-button]';
export const TOKEN_SEARCH_RESULTS = '[data-cy$=list-item]';
const VESTING_CODE_BUTTON = '[data-cy=vesting-code-button]';
const NAVIGATION_BUTTON_PREFIX = '[data-cy=nav-';
const NAVIGATION_DRAWER = '[data-cy=navigation-drawer]';
const VIEW_MODE_INPUT = '[data-cy=view-mode-inputs]';
const ADDRESS_DIALOG_INPUT = '[data-cy=address-dialog-input] input';
const VIEWED_ACCOUNT = '[data-cy=view-mode-chip] > span';
const VIEW_MODE_CHIP_CLOSE =
  '[data-cy=view-mode-chip] [data-testid=CancelIcon]';
const WEB3_MODAL = 'w3m-modal';
const ADDRESS_BOOK_ENTRIES = '[data-cy=address-book-entry]';
const ADDRESS_BOOK_RESULT_NAMES = '[data-cy=address-book-entry] h6';
const ADDRESS_BOOK_RESULT_ADDRESS = '[data-cy=address-book-entry] p';
const TESTNETS_BUTTON = '[data-cy=testnets-button]';
const MAINNETS_BUTTON = '[data-cy=mainnets-button]';
const NETWORK_SELECTION_BUTTON = '[data-cy=network-selection-button]';
const ERROR_PAGE_MESSAGE = '[data-cy=404-message]';
const RETURN_TO_DASHBOARD_BUTTON = '[data-cy=return-to-dashboard-button]';
const HELP_CENTER_LINK = '[data-cy=help-center-link]';
const RESTORE_BUTTONS = '[data-testid=ReplayIcon]';
const SENDER_RECEIVER_ADDRESSES = '[data-cy=sender-receiver-address]';
const STREAM_FLOW_RATES = '[data-cy=flow-rate]';
const START_END_DATES = '[data-cy=start-end-date]';
const RAINBOWKIT_CLOSE_BUTTON = '[aria-label=Close]';
const TX_ERROR = '[data-cy=tx-error]';
const CLOSE_BUTTON = '[data-testid=CloseRoundedIcon]';
const ACCESS_CODE_DIALOG = '[data-cy=access-code-dialog]';
const ACCESS_CODE_ERROR = '[data-cy=access-code-error]';
const ACCESS_CODE_MESSAGE = '[data-cy=access-code-error-msg]';
const VESTING_ACCESS_CODE_BUTTON = '[data-cy=more-vesting-code-btn]';
const STREAM_ROWS = '[data-cy=stream-row]';
const TIMER_ICONS = '[data-testid=TimerOutlinedIcon]';
const FAUCET_BUTTON = '[data-cy=more-faucet-btn]';
const AUTO_WRAP_NAVIGATION_BUTTON = '[data-cy=wrap-utility-btn]';
const CLAIM_TOKENS_BUTTON = '[data-cy=claim-button]';
const FAUCET_SUCCESS_MESSAGE = '[data-cy=faucet-success]';
const FAUCET_ERROR_MESSAGE = '[data-cy=faucet-error]';
const FAUCET_GO_TO_DASHBOARD = '[data-cy=open-dashboard-button]';
const FAUCET_WRAP_BUTTON = '[data-cy=wrap-button]';
const MUI_PRESENTATION = '.MuiDialog-root [role=presentation]';
const FAUCET_WALLET_ADDRESS = '[data-cy=connected-address] input';
const TOKEN_CHIPS = '.MuiChip-root';
const FAUCET_CONTRACT_ADDRESS = '0x74CDF863b00789c29734F8dFd9F83423Bc55E4cE';
const FAUCET_EXECUTION_CONTRACT_ADDRESS =
  '0x2e043853CC01ccc8275A3913B82F122C20Bc1256';
const NOTIFICATIONS_BUTTON = '[data-testid=NotificationsIcon]';
const NOTIF_SETTINGS_BUTTON = '[data-testid=SettingsOutlinedIcon]';
const NOTIF_ARCHIVE_BUTTON = '[data-cy=archive-button]';
const NOTIF_BADGE = '[aria-describedby=notifications-bell] span span';
const NOTIF_MESSAGE = '[data-cy=notification-message]';
const NOTIF_TITLE = '[data-cy=notification-title]';
const EMPTY_NOTIF_MESSAGE = '[data-cy=empty-notifs-message]';
const NOTIF_NO_WALLET_MESSAGE = '[data-cy=notif-no-wallet]';
const NOTIFICATION_MODAL = '#notifications-bell';
const NEW_NOTIF_DOT = '[data-cy=new-notif-dot]';
const WARNING_ICON = '[data-testid=ErrorIcon]';
const INFO_ICON = '[data-testid=InfoIcon]';
const TOAST_MESSAGE = '[data-cy=toast-notification-message]';
const TOAST_TITLE = '[data-cy=toast-notification-title]';
const TOAST_CLOSE_BUTTON = 'button[aria-label=close]';
const NOTIF_WRAP_TOKEN_BUTTON = '[data-cy=wrap-tokens-button]';
const LOADING_SKELETONS = '.MuiSkeleton-root';
const ADDRESS_SEARCH_DIALOG = '[data-cy=receiver-dialog]';
const CONNECTED_WALLET_BUTTON = '[data-cy=connected-wallet-button]';
const CONNECTED_WALLET_DIALOG = '[data-cy=account-modal]';
const DISCONNECT_BUTTON = '[data-cy=disconnect-button]';
const ADDRESS_MODAL_COPY_BUTTON = '[data-cy=address-modal-copy-button]';
const COPY_ICON = '[data-testid=ContentCopyRoundedIcon]';
const CHECKMARK_ICON = '[data-testid=CheckOutlinedIcon]';
const LENS_ENTRIES = '[data-cy=lens-entry]';
const LENS_NAMES = `${LENS_ENTRIES} h6`;
const LENS_ENTRY_ADDRESSES = `${LENS_ENTRIES} p`;
const ADDRESS_SEARCH_AVATAR_IMAGES =
  '[role=dialog] [class*=MuiListItemAvatar] img';
const DARK_MODE_BUTTON = '[data-cy=dark-mode-button]';
const LIGHT_MODE_BUTTON = '[data-cy=light-mode-button]';
const DARK_MODE_ICON = '[data-testid=DarkModeOutlinedIcon]';
const LIGHT_MODE_ICON = '[data-testid=LightModeOutlinedIcon]';
const GET_SUPER_TOKENS_ONBOARDING_CARD = '[data-cy=get-tokens-onboarding-card]';
const SEND_STREAM_ONBOARDING_CARD = '[data-cy=send-stream-onboarding-card]';
const MODIFY_OR_CANCEL_STREAM_ONBOARDING_CARD =
  '[data-cy=modify-or-cancel-streams-onboarding-card]';
const TRY_SUPERFLUID_ONBOARDING_CARD =
  '[data-cy=try-out-superfluid-onboarding-card]';
const MINIGAME_WARNING = '[data-cy=superfluid-runner-game-alert-text]';
const MINIGAME_COMPONENT = '[data-cy=minigame-component]';
const RECEIVER_BUTTON = '[data-cy=address-button]';
const RECENT_ENTRIES = '[data-cy=recents-entry]';
const TOKEN_SELECT_SYMBOL = '[data-cy=token-symbol-and-name] h6';
const TOKEN_SEARCH_INPUT = '[data-cy=token-search-input] input';
const TOKEN_NO_SEARCH_RESULTS = '[data-cy=token-search-no-results]';
const PREVIEW_BALANCE = '[data-cy=balance]';

const NEW_NOTIF_DATE = new Date(Date.now());
const NEW_NOTIF_STRING_DATE =
  BasePage.getNotificationDateString(NEW_NOTIF_DATE);
const OLD_NOTIF_DATE = new Date(1000 * BasePage.getDayTimestamp(-30));
const OLD_DATE_STRING = BasePage.getNotificationDateString(OLD_NOTIF_DATE);

export class Common extends BasePage {
  static validateEcosystemNavigationButtonHref() {
    cy.get('[data-cy=nav-ecosystem')
      .parent()
      .should('have.attr', 'href', 'https://www.superfluid.finance/ecosystem');
    cy.get('[data-cy=nav-ecosystem')
      .parent()
      .should('have.attr', 'target', '_blank');
  }

  static validateMiniGameContainerWithoutWalletConnected() {
    //Locally it just loads to an 403 :/
    this.hasAttributeWithValue(
      MINIGAME_COMPONENT,
      'src',
      'https://astrobunny.superfluid.finance/?level=1'
    );
  }
  static validateMiniGameCosmeticsWarningIsVisible() {
    this.isVisible(MINIGAME_WARNING);
    this.hasText(
      MINIGAME_WARNING,
      'To access and unlock in-game cosmetics, please connect your wallet before beginning the game.'
    );
  }
  static validateMiniGameCosmeticsWarningDoesNotExist() {
    this.doesNotExist(MINIGAME_WARNING);
  }
  static validateMiniGameContainerWithWalletConnected() {
    //Locally it just loads to an 403 :/
    cy.fixture('commonData').then((addresses) => {
      this.hasAttributeWithValue(
        MINIGAME_COMPONENT,
        'src',
        `https://astrobunny.superfluid.finance/?level=1&address=${addresses['john']}`
      );
    });
  }
  static clickMoreMenuButton(button: string) {
    this.click(`[data-cy=more-${button}-btn]`);
  }
  static hoverOnModifyStreamsOnboardingCard() {
    this.isVisible(MODIFY_OR_CANCEL_STREAM_ONBOARDING_CARD);
    cy.get(MODIFY_OR_CANCEL_STREAM_ONBOARDING_CARD)
      .parent()
      .trigger('mouseover');
    cy.get(MODIFY_OR_CANCEL_STREAM_ONBOARDING_CARD)
      .parent()
      .trigger('mouseout');
  }
  static clickModifyStreamsOnboardingCard() {
    this.click(MODIFY_OR_CANCEL_STREAM_ONBOARDING_CARD);
  }
  static validateWalletConnectionModalIsShown() {
    this.isVisible(WEB3_MODAL);
  }
  static blockLensAndENSApiRequests() {
    cy.intercept('POST', 'https://rpc-endpoints.superfluid.dev/eth-mainnet', {
      forceNetworkError: true,
    });
    cy.intercept('POST', 'https://api-v2.lens.dev/', {
      forceNetworkError: true,
    });
  }

  static validateErrorShownInRecepientList(lensOrEns: string) {
    this.isVisible(`[data-cy=${lensOrEns.toLowerCase()}-error]`);
  }

  static clickDarkModeButton() {
    this.click(DARK_MODE_BUTTON);
  }
  static validateDashboardIsInDarkMode() {
    this.hasAttributeWithValue('html', 'data-theme', 'dark');
    this.hasCSS('html', 'color-scheme', 'dark');
    this.isVisible(LIGHT_MODE_BUTTON);
    this.isVisible(LIGHT_MODE_ICON);

    this.doesNotExist(DARK_MODE_BUTTON);
    this.doesNotExist(DARK_MODE_ICON);
  }
  static clickLightModeButton() {
    this.click(LIGHT_MODE_BUTTON);
  }
  static validateDashboardIsInLightMode() {
    this.hasAttributeWithValue('html', 'data-theme', 'light');
    this.hasCSS('html', 'color-scheme', 'light');
    this.isVisible(DARK_MODE_BUTTON);
    this.isVisible(DARK_MODE_ICON);

    this.doesNotExist(LIGHT_MODE_ICON);
    this.doesNotExist(LIGHT_MODE_BUTTON);
  }

  static validateLensEntryIsVisible(account: string) {
    cy.get(LENS_NAMES, { timeout: 30000 })
      .contains(account)
      .should('be.visible');
  }
  static validateLensImageIsLoaded(account: string) {
    cy.fixture('ensAndLensAvatarUrls').then((urls) => {
      cy.get(ADDRESS_SEARCH_AVATAR_IMAGES, { timeout: 60000 })
        .should('have.attr', 'src', urls[account])
        .and('be.visible');
    });
  }
  static clickOnFirstLensEntry() {
    this.click(LENS_ENTRIES, 0);
  }
  static clickOnAddressModalCopyButton() {
    this.isVisible(COPY_ICON);
    this.hasText(ADDRESS_MODAL_COPY_BUTTON, 'Copy Address').click();
  }
  static validateCopiedAddressInAddressModal() {
    this.isVisible(CHECKMARK_ICON);
    this.hasText(ADDRESS_MODAL_COPY_BUTTON, 'Copied!');
    this.isVisible(COPY_ICON);
    this.hasText(ADDRESS_MODAL_COPY_BUTTON, 'Copy Address');
  }
  static clickDisconnectButton() {
    this.click(DISCONNECT_BUTTON);
  }
  static validateNoConnectedAccountDialogExists() {
    this.doesNotExist(CONNECTED_WALLET_DIALOG);
  }
  static clickOnConnectedWalletModal() {
    this.click(CONNECTED_WALLET_BUTTON);
  }

  static validateNoViewModeDialogExists() {
    this.doesNotExist(ADDRESS_DIALOG_INPUT);
    this.doesNotExist(ADDRESS_SEARCH_DIALOG);
  }
  static waitForSpookySkeletonsToDisapear() {
    this.doesNotExist(LOADING_SKELETONS, undefined, { timeout: 120000 });
  }

  static clickNavBarButton(button: string) {
    this.click(`${NAVIGATION_BUTTON_PREFIX + button}]`);
  }

  static openPage(page: string, account?: string, network?: string) {
    this.getPageUrlByName(page.toLowerCase()).then((url) => {
      this.visitPage(url, account, network);
    });
    if (Cypress.env('dev')) {
      //The nextjs error is annoying when developing test cases in dev mode
      cy.get('nextjs-portal').shadow().find('[aria-label=Close]').click();
    }
  }

  static visitPage(page: string, account?: string, network?: string) {
    if (account && network) {
      this.openDashboardWithConnectedTxAccount(page, account, network);
    } else {
      //Just to test 404 pages
      cy.visit(page, { failOnStatusCode: false });
    }
  }

  static openDashboardWithConnectedTxAccount(
    page: string,
    persona: string,
    network: string
  ) {
    let usedAccountPrivateKey;
    let personas = ['alice', 'bob', 'dan', 'john'];
    let selectedNetwork = this.getSelectedNetwork(network);

    if (personas.includes(persona)) {
      let chosenPersona = personas.findIndex((el) => el === persona) + 1;
      usedAccountPrivateKey = Cypress.env(
        `TX_ACCOUNT_PRIVATE_KEY${chosenPersona}`
      );
    } else if (persona === 'NewRandomWallet') {
      usedAccountPrivateKey = this.generateNewWallet();
    } else {
      usedAccountPrivateKey =
        persona === 'staticBalanceAccount'
          ? Cypress.env('STATIC_BALANCE_ACCOUNT_PRIVATE_KEY')
          : Cypress.env('ONGOING_STREAM_ACCOUNT_PRIVATE_KEY');
    }

    let chainId = networksBySlug.get(selectedNetwork)?.id;
    let networkRpc = networksBySlug.get(selectedNetwork)?.superfluidRpcUrl;

    cy.visit(page, {
      onBeforeLoad: (window) => {
        try {
          const hdwallet = new HDWalletProvider({
            privateKeys: [usedAccountPrivateKey],
            url: networkRpc,
            chainId: chainId,
            pollingInterval: 1000,
          });
          console.log('hdwallet', hdwallet);
          if (Cypress.env('rejected')) {
            // Make HDWallet automatically reject transaction.
            // Inspired by: https://github.com/MetaMask/web3-provider-engine/blob/e835b80bf09e76d92b785d797f89baa43ae3fd60/subproviders/hooked-wallet.js#L326
            for (const provider of hdwallet.engine['_providers']) {
              console.log('provider', provider);
              if (provider.checkApproval) {
                provider.checkApproval = function (type, didApprove, cb) {
                  cb(new Error(`User denied ${type} signature.`));
                };
              }
            }
          }

          if (!hdwallet) {
            console.log('Error: HDWalletProvider not initialized properly');
            return;
          }

          const mockBridge = new ProviderAdapter(hdwallet);
          window['mockBridge'] = mockBridge;
          window['mockWallet'] = hdwallet;

          window['mockWalletDebug'] = {
            chainId,
            network: selectedNetwork,
            address: hdwallet.getAddress(),
          };

          setTimeout(() => {
            const ethereum = mockBridge;
            if (ethereum) {
              console.log('Manually triggering chainChanged event');
              (ethereum as any).emit?.(
                'chainChanged',
                `0x${chainId.toString(16)}`
              );
            }
          }, 500);
        } catch (e) {
          console.log('Error during wallet provider setup: ' + e.message);
          console.error('Error during wallet provider setup: ', e);
        }
      },
    });

    if (Cypress.env('dev')) {
      //The nextjs error is annoying when developing test cases in dev mode
      cy.get('nextjs-portal').shadow().find('[aria-label=Close]').click();
    }

    this.doesNotExist(CONNECT_WALLET_BUTTON);

    cy.get(WALLET_CONNECTION_STATUS, { timeout: 15000 }).then((el) => {
      if (el.text() === 'Wrong network') {
        this.changeNetwork(selectedNetwork);

        cy.get(WALLET_CONNECTION_STATUS, { timeout: 10000 }).should((el) => {
          if (el.text() !== 'Connected') {
            cy.log('Still on wrong network, trying alternative approach...');
            let workaroundNetwork =
              selectedNetwork === 'avalanche-fuji'
                ? 'eth-sepolia'
                : 'avalanche-fuji';
            this.changeNetwork(workaroundNetwork);
            this.changeNetwork(selectedNetwork);
          }
        });
      }

      cy.get(WALLET_CONNECTION_STATUS, { timeout: 10000 }).should((el) => {
        console.log(`Final wallet status: ${el.text()}`);
      });
    });
  }

  static rejectTransactions() {
    cy.log('Cypress will reject HDWalletProvider Transactions!');
    Cypress.env('rejected', true);
  }

  static clickConnectWallet() {
    this.clickFirstVisible(CONNECT_WALLET_BUTTON);
  }

  static clickInjectedWallet() {
    this.isVisible(WEB3_MODAL);
    cy.contains('MetaMask').click();
  }

  static clickMockWallet() {
    this.isVisible(WEB3_MODAL);
    cy.contains('Mock').click();
  }

  static changeNetwork(network: string) {
    this.click(TOP_BAR_NETWORK_BUTTON, 0);
    this.click(MAINNETS_BUTTON);
    cy.wait(1000);
    if (networksBySlug.get(network)?.testnet) {
      this.click(TESTNETS_BUTTON);
      cy.wait(1000);
    }
    this.click(`[data-cy=${network}-button]`);
  }

  static checkNavBarWalletStatus(account: string, message: string) {
    cy.fixture('commonData').then((commonData) => {
      this.hasText(WALLET_CONNECTION_STATUS, message);
      this.hasText(CONNECTED_WALLET, BasePage.shortenHex(commonData[account]));
    });
  }

  static drawerConnectWalletButtonIsVisible() {
    this.isVisible(`${NAVIGATION_DRAWER} ${CONNECT_WALLET_BUTTON}`);
  }

  static viewAccount(account: string) {
    cy.fixture('commonData').then((commonData) => {
      let addressToLookFor = commonData[account]
        ? commonData[account]
        : account;
      this.click(VIEW_MODE_INPUT);
      this.type(ADDRESS_DIALOG_INPUT, addressToLookFor);
    });
  }

  static viewModeChipDoesNotExist() {
    this.doesNotExist(VIEW_MODE_CHIP_CLOSE);
    this.doesNotExist(VIEWED_ACCOUNT);
  }

  static typeIntoAddressInput(address: string) {
    if (address.includes('.lens')) {
      cy.intercept('**api-v2.lens.dev**').as('lensQuery');
      this.type(ADDRESS_DIALOG_INPUT, address);
      cy.wait('@lensQuery', { timeout: 30000 });
    } else {
      this.type(ADDRESS_DIALOG_INPUT, address);
    }
  }

  static clickOnViewModeButton() {
    this.click(VIEW_MODE_INPUT);
  }

  static validateAddressBookSearchResult(name: string, address: string) {
    this.isVisible(ADDRESS_BOOK_ENTRIES);
    this.hasText(ADDRESS_BOOK_RESULT_NAMES, name);
    this.hasText(ADDRESS_BOOK_RESULT_ADDRESS, address);
  }

  static chooseFirstAddressBookResult() {
    this.click(ADDRESS_BOOK_ENTRIES);
  }

  static validateViewModeChipMessage(message: string) {
    this.hasText(VIEWED_ACCOUNT, `Viewing ${message}`);
  }

  static changeVisibleNetworksTo(type: string) {
    let clickableButton =
      type === 'testnet' ? TESTNETS_BUTTON : MAINNETS_BUTTON;
    this.click(NETWORK_SELECTION_BUTTON);
    this.click(clickableButton);
    this.click(DROPDOWN_BACKDROP);
  }

  static openNetworkSelectionDropdown() {
    this.click(NETWORK_SELECTION_BUTTON);
    cy.wait(10000);
  }

  static closeDropdown() {
    this.click(DROPDOWN_BACKDROP);
  }

  static errorPageIsVisible() {
    this.isVisible(ERROR_PAGE_MESSAGE);
    this.isVisible(RETURN_TO_DASHBOARD_BUTTON);
    this.isVisible(HELP_CENTER_LINK);
  }

  static restoreLastTx() {
    this.clickFirstVisible(RESTORE_BUTTONS);
  }

  static validateStreamsTable(network: string, selector: string) {
    cy.fixture('networkSpecificData').then((networkSpecificData) => {
      this.hasLength(
        selector,
        networkSpecificData[network].ongoingStreamsAccount.tokenValues.streams
          .length
      );
      networkSpecificData[
        network
      ].ongoingStreamsAccount.tokenValues.streams.forEach(
        (stream: any, index: number) => {
          this.hasText(
            `${selector} ${STREAM_FLOW_RATES}`,
            stream.flowRate,
            index
          );
          this.hasText(
            `${selector} ${SENDER_RECEIVER_ADDRESSES}`,
            stream.fromTo,
            index
          );
          this.hasText(`${selector} ${START_END_DATES}`, stream.endDate, index);
        }
      );
    });
  }

  static mockQueryToEmptyState(operationName: string) {
    cy.intercept('POST', '**subgraph.x.superfluid.dev**', (req) => {
      const { body } = req;
      if (
        body.hasOwnProperty('operationName') &&
        body.operationName === operationName
      ) {
        req.alias = `${operationName}Query`;
        req.continue((res) => {
          res.body.data[operationName] = [];
        });
      }
    });
  }

  static disconnectWallet() {
    this.click(WALLET_CONNECTION_STATUS);
    this.click(DISCONNECT_BUTTON);
  }

  static wait(seconds: number) {
    cy.wait(seconds * 1000);
  }

  static transactionRejectedErrorIsShown() {
    Cypress.once('uncaught:exception', (err) => {
      if (err.message.includes('user rejected transaction')) {
        return false;
      }
    });
    cy.get(TX_ERROR, { timeout: 60000 }).should(
      'have.text',
      'Transaction Rejected'
    );
  }

  static validateNoEthereumMainnetShownInDropdown() {
    this.doesNotExist('[data-cy=ethereum-button]');
  }

  static openNavigationMoreMenu() {
    this.click(NAVIGATION_MORE_BUTTON);
  }

  static openAccessCodeMenu() {
    this.click(ACCESS_CODE_BUTTON);
  }

  static inputAccessCode(code: string) {
    this.type(ACCESS_CODE_INPUT, code);
  }

  static submitAccessCode() {
    this.click(ACCESS_CODE_SUBMIT);
  }

  static validateAccessCodeWindowNotExisting() {
    this.doesNotExist(ACCESS_CODE_DIALOG);
  }

  static validateEthMainnetVisibleInNetworkSelection() {
    this.isVisible('[data-cy=ethereum-button]');
  }

  static validateInvalidAccessCodeError() {
    this.isVisible(ACCESS_CODE_ERROR);
    this.hasText(ACCESS_CODE_MESSAGE, 'Invalid Access Code!');
  }

  static closeAccessCodeDialog() {
    this.click(CLOSE_BUTTON);
  }

  static openDashboardNetworkSelectionDropdown() {
    this.click(TOP_BAR_NETWORK_BUTTON);
  }

  static checkThatSuperfluidRPCisNotBehind(minutes: number, network: string) {
    const publicClient = createPublicClient({
      transport: http(networksBySlug.get(network).superfluidRpcUrl),
    });

    cy.wrap(null).then(() => {
      return publicClient.getBlock({ blockTag: 'latest' }).then((block) => {
        let blockVsTimeNowDifferenceInMinutes =
          (Date.now() - Number(block.timestamp) * 1000) / 1000 / 60;
        expect(blockVsTimeNowDifferenceInMinutes).to.be.lessThan(
          minutes,
          `${
            networksBySlug.get(network).name
          } RPC node is behind by ${blockVsTimeNowDifferenceInMinutes.toFixed(
            0
          )} minutes.
       Latest block number: ${block.number}`
        );
      });
    });
  }

  static checkThatTheGraphIsNotBehind(minutes: number, network: string) {
    cy.request({
      method: 'POST',
      url: networksBySlug.get(network).subgraphUrl,
      body: {
        operationName: 'MyQuery',
        query:
          'query MyQuery {' +
          '  _meta {' +
          '    hasIndexingErrors' +
          '    block {' +
          '      number' +
          '      timestamp' +
          '    }' +
          '  }' +
          '}',
      },
    }).then((res) => {
      let metaData = res.body.data._meta;
      let blockVsTimeNowDifferenceInMinutes =
        (Date.now() - metaData.block.timestamp * 1000) / 1000 / 60;
      //Sometimes the graph meta does not return timestamp for blocks, don't assert if it is so
      if (metaData.block.timestamp !== null) {
        expect(metaData.hasIndexingErrors).to.be.false;
        expect(blockVsTimeNowDifferenceInMinutes).to.be.lessThan(
          minutes,
          `${
            networksBySlug.get(network).name
          } graph is behind by ${blockVsTimeNowDifferenceInMinutes.toFixed(
            0
          )} minutes.
       Last synced block number: ${metaData.block.number} 
       URL:
       ${networksBySlug.get(network).subgraphUrl}
      `
        );
      }
    });
  }

  static inputDateIntoField(selector: string, amount: number, timeUnit) {
    let newDate: Date;
    let currentTime = new Date();
    const unitOfTime = wordTimeUnitMap[timeUnit];
    if (unitOfTime === undefined) {
      throw new Error(`Invalid time unit: ${timeUnit}`);
    }

    newDate = new Date(currentTime.getTime() + amount * (unitOfTime * 1000));

    const month = `0${newDate.getMonth() + 1}`.slice(-2);
    const day = `0${newDate.getDate()}`.slice(-2);
    const year = newDate.getFullYear();
    const hours = `0${newDate.getHours()}`.slice(-2);
    const minutes = `0${newDate.getMinutes()}`.slice(-2);
    const finalFutureDate = `${month}/${day}/${year} ${hours}:${minutes}`;

    this.type(selector, finalFutureDate);
  }

  static validateScheduledStreamRow(
    address: string,
    flowRate: number,
    startEndDate: string
  ) {
    cy.contains(SENDER_RECEIVER_ADDRESSES, this.shortenHex(address))
      .parents(STREAM_ROWS)
      .find(STREAM_FLOW_RATES)
      .should('have.text', `${flowRate}/mo`);
    cy.contains(SENDER_RECEIVER_ADDRESSES, this.shortenHex(address))
      .parents(STREAM_ROWS)
      .find(START_END_DATES)
      .should('have.text', startEndDate);
    cy.contains(SENDER_RECEIVER_ADDRESSES, this.shortenHex(address))
      .parents(STREAM_ROWS)
      .find(TIMER_ICONS)
      .should('be.visible');
  }

  static openFaucetMenu() {
    this.click(FAUCET_BUTTON);
  }

  static openAutoWrapPage() {
    this.click(AUTO_WRAP_NAVIGATION_BUTTON);
  }

  static validateConnectWalletButtonInFaucetMenu() {
    this.isVisible(`[role=dialog] ${CONNECT_WALLET_BUTTON}`);
  }

  static validateSwitchNetworkButtonInFaucetMenu() {
    this.isVisible(CHANGE_NETWORK_BUTTON);
    this.hasText(CHANGE_NETWORK_BUTTON, 'Change Network to OP Sepolia');
  }

  static clickSwitchNetworkButton() {
    this.click(CHANGE_NETWORK_BUTTON);
  }

  static validateSelectedNetwork(networkName: string) {
    this.containsText(TOP_BAR_NETWORK_BUTTON, networkName);
  }

  static mockFaucetRequestsToFailure() {
    cy.intercept('OPTIONS', '**fund-me-on-multi-network', {
      statusCode: 500,
      body: {},
    });
  }

  static clickClaimTokensButton() {
    this.click(CLAIM_TOKENS_BUTTON);
  }

  static validateDisabledClaimTokensButton() {
    this.isDisabled(CLAIM_TOKENS_BUTTON);
    this.hasText(CLAIM_TOKENS_BUTTON, 'Tokens Claimed');
  }

  static validateFaucetSuccessMessage() {
    this.hasText(
      FAUCET_SUCCESS_MESSAGE,
      'Streams opened and testnet tokens successfully sent'
    );
  }

  static clickFaucetGoToDashboardButton() {
    this.click(FAUCET_GO_TO_DASHBOARD);
  }

  static validateYouHaveAlreadyClaimedTokensMessage() {
    this.isVisible(FAUCET_ERROR_MESSAGE);
    this.hasText(
      FAUCET_ERROR_MESSAGE,
      "You've already claimed tokens from the faucet using this address"
    );
  }

  static clickFaucetMenuWrapButton() {
    this.click(FAUCET_WRAP_BUTTON);
  }

  static validateSomethingWentWrongMessageInFaucet() {
    this.isVisible(FAUCET_ERROR_MESSAGE);
    this.hasText(
      FAUCET_ERROR_MESSAGE,
      'Something went wrong, please try again'
    );
  }

  static closePresentationDialog() {
    this.click(MUI_PRESENTATION);
  }

  static validateNewWalletAddress() {
    cy.get('@newWalletPublicKey').then((address) => {
      this.hasValue(FAUCET_WALLET_ADDRESS, address.toString());
    });
  }

  static validateOpenFaucetView() {
    const FAUCET_TOKENS = ['MATIC', 'fUSDC', 'fDAI'];
    this.isVisible(CLAIM_TOKENS_BUTTON);
    FAUCET_TOKENS.forEach((token) => {
      this.containsText(TOKEN_CHIPS, token);
    });
    this.isVisible(FAUCET_WALLET_ADDRESS);
  }

  static mockNotificationRequestsTo(type: string) {
    cy.intercept('GET', '**/feeds**', (req) => {
      req.continue((res) => {
        switch (type.toLowerCase()) {
          case 'liquidated':
            res.body = {
              feeds: [
                {
                  payload_id: 3769521,
                  sender: '0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa',
                  epoch: NEW_NOTIF_DATE.toISOString(),
                  payload: {
                    data: {
                      app: 'Superfluid',
                      sid: '40196540',
                      url: 'https://app.superfluid.org',
                      acta: 'https://app.superfluid.org/',
                      aimg: '',
                      amsg: `Your TDLx(TDLx) on network Polygon was liquidated (at ${NEW_NOTIF_STRING_DATE}).[timestamp: ${
                        NEW_NOTIF_DATE.getTime() / 100
                      }]`,
                      asub: 'Liquidated',
                      icon: 'https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA',
                      type: 3,
                      epoch: NEW_NOTIF_DATE.getTime() / 100,
                      etime: null,
                      hidden: '0',
                      sectype: null,
                      additionalMeta: null,
                    },
                    recipients: {
                      'eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2': null,
                    },
                    notification: {
                      body: `type:liquidation,network:polygon,symbol:TDLx,token:TDLx,tokenAddress:0xa794221d92d77490ff319e95da1461bdf2bd3953,liquidation:${(
                        NEW_NOTIF_DATE.getTime() / 1000
                      ).toFixed(0)}`,
                      title: 'Superfluid - Liquidated',
                    },
                    verificationProof:
                      'eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989',
                  },
                  source: 'ETH_MAINNET',
                  etime: null,
                },
              ],
            };
            break;
          case 'old notification':
            res.body = {
              feeds: [
                {
                  payload_id: 3769521,
                  sender: '0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa',
                  epoch: OLD_NOTIF_DATE.toISOString(),
                  payload: {
                    data: {
                      app: 'Superfluid',
                      sid: '40196540',
                      url: 'https://app.superfluid.org',
                      acta: 'https://app.superfluid.org/',
                      aimg: '',
                      amsg: `Your TDLx(TDLx) on network Polygon is about to be liquidated in less than 7 days(at ${OLD_DATE_STRING}).[timestamp: ${
                        OLD_NOTIF_DATE.getTime() / 100
                      }]`,
                      asub: 'Liquidation Risk',
                      icon: 'https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA',
                      type: 3,
                      epoch: OLD_NOTIF_DATE.getTime() / 100,
                      etime: null,
                      hidden: '0',
                      sectype: null,
                      additionalMeta: null,
                    },
                    recipients: {
                      'eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2': null,
                    },
                    notification: {
                      body: `type:liquidation-risk-7day,network:polygon,symbol:TDLx,token:TDLx,tokenAddress:0xa794221d92d77490ff319e95da1461bdf2bd3953,liquidation:${(
                        OLD_NOTIF_DATE.getTime() / 1000
                      ).toFixed(0)}`,
                      title: 'Superfluid - Liquidation Risk',
                    },
                    verificationProof:
                      'eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989',
                  },
                  source: 'ETH_MAINNET',
                  etime: null,
                },
              ],
            };
            break;
          case 'liquidation risk':
            res.body = {
              feeds: [
                {
                  payload_id: 3769521,
                  sender: '0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa',
                  epoch: NEW_NOTIF_DATE.toISOString(),
                  payload: {
                    data: {
                      app: 'Superfluid',
                      sid: '40196540',
                      url: 'https://app.superfluid.org',
                      acta: 'https://app.superfluid.org/',
                      aimg: '',
                      amsg: `Your TDLx(TDLx) on network Polygon is about to be liquidated in less than 7 days(at ${NEW_NOTIF_STRING_DATE}).[timestamp: ${
                        NEW_NOTIF_DATE.getTime() / 100
                      }]`,
                      asub: 'Liquidation Risk',
                      icon: 'https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA',
                      type: 3,
                      epoch: NEW_NOTIF_DATE.getTime() / 100,
                      etime: null,
                      hidden: '0',
                      sectype: null,
                      additionalMeta: null,
                    },
                    recipients: {
                      'eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2': null,
                    },
                    notification: {
                      body: `type:liquidation-risk-7day,network:polygon,symbol:TDLx,token:TDLx,tokenAddress:0xa794221d92d77490ff319e95da1461bdf2bd3953,liquidation:${(
                        NEW_NOTIF_DATE.getTime() / 1000
                      ).toFixed(0)}`,
                      title: 'Superfluid - Liquidation Risk',
                    },
                    verificationProof:
                      'eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989',
                  },
                  source: 'ETH_MAINNET',
                  etime: null,
                },
              ],
            };
            break;
          case 'urgent liquidation risk':
            res.body = {
              feeds: [
                {
                  payload_id: 3769521,
                  sender: '0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa',
                  epoch: NEW_NOTIF_DATE.toISOString(),
                  payload: {
                    data: {
                      app: 'Superfluid',
                      sid: '40196540',
                      url: 'https://app.superfluid.org',
                      acta: 'https://app.superfluid.org/',
                      aimg: '',
                      amsg: `Your TDLx(TDLx) on network Polygon is about to be liquidated in less than 7 days(at ${NEW_NOTIF_STRING_DATE}).[timestamp: ${
                        NEW_NOTIF_DATE.getTime() / 100
                      }]`,
                      asub: 'Urgent Liquidation Risk',
                      icon: 'https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA',
                      type: 3,
                      epoch: NEW_NOTIF_DATE.getTime() / 100,
                      etime: null,
                      hidden: '0',
                      sectype: null,
                      additionalMeta: null,
                    },
                    recipients: {
                      'eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2': null,
                    },
                    notification: {
                      body: `type:liquidation-risk-2day,network:polygon,symbol:TDLx,token:TDLx,tokenAddress:0xa794221d92d77490ff319e95da1461bdf2bd3953,liquidation:${(
                        NEW_NOTIF_DATE.getTime() / 1000
                      ).toFixed(0)}`,
                      title: 'Superfluid - Urgent Liquidation Risk',
                    },
                    verificationProof:
                      'eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989',
                  },
                  source: 'ETH_MAINNET',
                  etime: null,
                },
              ],
            };
            break;
          case 'outdated format':
            res.body = {
              feeds: [
                {
                  payload_id: 3769521,
                  sender: '0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa',
                  epoch: NEW_NOTIF_DATE.toISOString(),
                  payload: {
                    data: {
                      app: 'Superfluid',
                      sid: '40196540',
                      url: 'https://app.superfluid.org',
                      acta: 'https://app.superfluid.org/',
                      aimg: '',
                      amsg: `Some Test message`,
                      asub: 'What happens with outdated formats?',
                      icon: 'https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA',
                      type: 3,
                      epoch: NEW_NOTIF_DATE.getTime() / 100,
                      etime: null,
                      hidden: '0',
                      sectype: null,
                      additionalMeta: null,
                    },
                    recipients: {
                      'eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2': null,
                    },
                    notification: {
                      body: `This is an outdated format aka something that is not explicitly handled`,
                      title: 'Outdated Format',
                    },
                    verificationProof:
                      'eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989',
                  },
                  source: 'ETH_MAINNET',
                  etime: null,
                },
              ],
            };
            break;
          default:
            throw new Error(`Unknown notification type: ${type}`);
        }
      });
    });
  }

  static clickNotificationButton() {
    this.click(NOTIFICATIONS_BUTTON);
  }

  static validateNoNewNotificationsMessage(tab: string) {
    this.hasText(
      EMPTY_NOTIF_MESSAGE,
      `You don't have any ${tab} notifications.`
    );
  }

  static switchNotificationTabTo(tab: string) {
    this.click(`[data-cy=${tab}-tab]`);
  }

  static validateNotSubscribedMessage() {
    this.hasText(
      EMPTY_NOTIF_MESSAGE,
      'You are not subscribed. Check settings to enable notifications'
    );
  }

  static validateConnectWalletButtonInNotifModal() {
    this.hasText(
      NOTIF_NO_WALLET_MESSAGE,
      'Connect your wallet to check your notifications.'
    );
    this.isVisible(`${NOTIFICATION_MODAL} ${CONNECT_WALLET_BUTTON}`);
  }

  static validateNotificationToast(type: string) {
    this.validateNotifTitleAndMessage(TOAST_MESSAGE, TOAST_TITLE, type, true);
  }

  static validateNotificationBadge(amount: string) {
    if (amount === '0') {
      this.isNotVisible(NOTIF_BADGE);
    } else {
      this.hasText(NOTIF_BADGE, amount);
    }
  }

  static archiveLastNotification() {
    //One of the rare cases where triggering mouseevents or invoking show function does not make the element visible
    this.forceClick(NOTIF_ARCHIVE_BUTTON, 0);
  }

  static validateArchivedNotification(type: string) {
    this.validateNotifTitleAndMessage(NOTIF_MESSAGE, NOTIF_TITLE, type, true);
  }

  static validateNewNotification(type: string) {
    this.isVisible(NEW_NOTIF_DOT);
    this.validateNotifTitleAndMessage(NOTIF_MESSAGE, NOTIF_TITLE, type, false);
  }

  static validateReadNotification(type: string) {
    this.doesNotExist(NEW_NOTIF_DOT);
    this.validateNotifTitleAndMessage(NOTIF_MESSAGE, NOTIF_TITLE, type, false);
  }

  static validateNotifTitleAndMessage(
    messageSelector: string,
    titleSelector: string,
    type: string,
    archivedOrToast: boolean
  ) {
    const ASSERT_STRING =
      type.toLowerCase() === 'old notification'
        ? this.getNotifDateAssertStringFromDate(OLD_NOTIF_DATE)
        : this.getNotifDateAssertStringFromDate(NEW_NOTIF_DATE);
    switch (type.toLowerCase()) {
      case 'liquidated':
        this.hasText(titleSelector, ` ${type}`);
        this.isVisible(LIQUIDATED_OR_CANCEL_ICON);
        this.hasText(
          messageSelector,
          `Your TDLx on Polygon was liquidated at ${ASSERT_STRING}.`
        );
        this.validateNoWrapButtonsInNotifModal();
        break;
      case 'old notification':
        this.hasText(titleSelector, ` Liquidation Risk`);
        this.isVisible(WARNING_ICON);
        this.validateNoWrapButtonsInNotifModal();
        this.hasText(
          messageSelector,
          `Your TDLx on Polygon is about to be liquidated at ${ASSERT_STRING}.`
        );
        break;
      case 'liquidation risk':
        this.hasText(titleSelector, ` ${type}`);
        this.isVisible(WARNING_ICON);
        if (!archivedOrToast) {
          this.validateWrapButtonsInNotifModal();
        }
        this.hasText(
          messageSelector,
          `Your TDLx on Polygon is about to be liquidated at ${ASSERT_STRING}.`
        );
        break;
      case 'urgent liquidation risk':
        this.hasText(titleSelector, ` ${type}`);
        this.isVisible(WARNING_ICON);
        if (!archivedOrToast) {
          this.validateWrapButtonsInNotifModal();
        }
        this.hasText(
          messageSelector,
          `Your TDLx on Polygon is about to be liquidated at ${ASSERT_STRING}.`
        );
        break;
      case 'outdated format':
        this.isVisible(INFO_ICON);
        this.hasText(
          messageSelector,
          'This is an outdated format aka something that is not explicitly handled'
        );
        this.validateNoWrapButtonsInNotifModal();
        break;
    }
  }

  static validateWrapButtonsInNotifModal() {
    this.isVisible(NOTIF_WRAP_TOKEN_BUTTON);
  }

  static clickWrapButtonInNotifModal() {
    this.clickFirstVisible(NOTIF_WRAP_TOKEN_BUTTON);
  }

  static validateNoWrapButtonsInNotifModal() {
    this.doesNotExist(NOTIF_WRAP_TOKEN_BUTTON);
  }

  static clickNotificationSettingsButton() {
    this.click(NOTIF_SETTINGS_BUTTON);
  }

  static getPageUrlByName(name: string) {
    return cy.fixture('streamData').then((streamData) => {
      cy.fixture('vestingData').then((vestingData) => {
        const pagesAliases = {
          'dashboard page': '/',
          'wrap page': '/wrap',
          'send page': '/send',
          'transfer page': '/transfer',
          'ecosystem page': '/ecosystem',
          'address book page': '/address-book',
          'activity history page': '/history',
          'bridge page': '/bridge',
          'settings page': '/settings',
          'vesting page': '/vesting',
          'accounting export page': '/accounting',
          'auto-wrap page': '/auto-wrap',
          'invalid stream details page':
            '/stream/polygon/testing-testing-testing',
          'ended stream details page':
            streamData['staticBalanceAccount']['polygon'][0].v2Link,
          'ongoing stream details page':
            streamData['ongoingStreamAccount']['polygon'][0].v2Link,
          'v1 ended stream details page':
            streamData['staticBalanceAccount']['polygon'][0].v1Link,
          'close-ended stream details page':
            streamData['john']['opsepolia'][0].v2Link,
          'vesting details page': `/vesting/opsepolia/${vestingData['opsepolia'].fTUSDx.schedule.id}`,
          'vesting stream details page': `/stream/polygon/${vestingData.polygon.USDCx.vestingStream.id}`,
          '404 token page': '/token/polygon/Testing420HaveANiceDay',
          '404 vesting page': '/vesting/polygon/Testing',
          'minigame page': '/superfluid-runner',
        };
        if (pagesAliases[name] === undefined) {
          throw new Error(`Hmm, you haven't set up the link for : ${name}`);
        }
        return pagesAliases[name];
      });
    });
  }

  static openViewModePage(page: string, account: string) {
    cy.fixture('commonData').then((data) => {
      this.getPageUrlByName(page.toLowerCase()).then((url) => {
        cy.visit(`${url}?view=${data[account]}`);
      });
    });
  }

  static validateAddressBookNamesInTables(names: string) {
    let aliases = names.split(',');
    aliases.forEach((name, index) => {
      this.hasText(SENDER_RECEIVER_ADDRESSES, name, index, { timeout: 30000 });
    });
  }

  static clearReceiverField() {
    this.clear(ADDRESS_DIALOG_INPUT);
  }

  static checkConnectWalletButton() {
    this.isVisible(CONNECT_WALLET_BUTTON);
    this.isNotDisabled(CONNECT_WALLET_BUTTON);
    this.hasText(`main ${CONNECT_WALLET_BUTTON}`, 'Connect Wallet');
  }

  static openTokenSelection() {
    this.click(SELECT_TOKEN_BUTTON);
    this.exists(TOKEN_SEARCH_RESULTS, undefined, { timeout: 45000 });
  }

  static searchForTokenInTokenList(token: string) {
    this.type(TOKEN_SEARCH_INPUT, token);
  }

  static validateSendPagePreviewBalance() {
    cy.fixture('networkSpecificData').then((networkSpecificData) => {
      let selectedValues =
        networkSpecificData.polygon.staticBalanceAccount.tokenValues[0].balance;

      this.hasText(PREVIEW_BALANCE, `${selectedValues} `);
    });
  }

  static receiverDialog() {
    this.click(RECEIVER_BUTTON);
  }

  static recentReceiversAreShown(network: string) {
    cy.fixture('networkSpecificData').then((networkSpecificData) => {
      networkSpecificData[network].staticBalanceAccount.recentReceivers.forEach(
        (receiver: any, index: number) => {
          this.hasText(RECENT_ENTRIES, receiver.address, index);
        }
      );
    });
  }

  static searchForReceiver(ensNameOrAddress: string, index = 0) {
    this.click(RECEIVER_BUTTON, index);
    this.type(ADDRESS_DIALOG_INPUT, ensNameOrAddress);
    cy.wrap(ensNameOrAddress).as('ensNameOrAddress');
  }

  static tokenSearchResultsOnlyContain(token: string) {
    cy.get(`[data-cy*=-list-item] ${TOKEN_SELECT_SYMBOL}`).each((el) => {
      cy.wrap(el).should('contain', token);
    });
  }

  static clearTokenSearchField() {
    this.clear(TOKEN_SEARCH_INPUT);
  }

  static tokenSearchNoResultsMessageIsShown() {
    this.isVisible(TOKEN_NO_SEARCH_RESULTS);
    this.hasText(TOKEN_NO_SEARCH_RESULTS, 'Could not find any tokens. :(');
  }

  static changeNetworkButtonShowsCorrectNetwork(network: string) {
    this.hasText(
      CHANGE_NETWORK_BUTTON,
      `Change Network to ${networksBySlug.get(network)?.name}`
    );
  }
}
