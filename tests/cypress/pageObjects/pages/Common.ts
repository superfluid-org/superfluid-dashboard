import { BasePage, wordTimeUnitMap } from '../BasePage';
import { networksBySlug } from '../../superData/networks';
import {
  http,
  createPublicClient,
  createWalletClient,
  numberToHex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const TOP_BAR_NETWORK_BUTTON = '[data-cy=top-bar-network-button]';
export const CONNECTED_WALLET = '[data-cy=wallet-connection-status] h6';
export const WALLET_CONNECTION_STATUS = '[data-cy=wallet-connection-status] p';
export const ACCESS_CODE_BUTTON = '[data-cy=more-access-code-btn]';
export const ACCESS_CODE_INPUT = '[data-cy=access-code-input]';
export const ACCESS_CODE_SUBMIT = '[data-cy=submit-access-code]';
export const CONNECT_WALLET_BUTTON = '[data-cy=connect-wallet-button]';
export const TOKEN_ANIMATION = '[data-cy=animation]';
export const TOKEN_BALANCE = '[data-cy=token-balance]';
export const CHANGE_NETWORK_BUTTON = '[data-cy=change-network-button]';
export const DROPDOWN_BACKDROP = '[role=presentation]';
export const LIQUIDATED_OR_CANCEL_ICON = '.MuiChip-deleteIcon';
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
  '[data-cy=view-mode-chip] .MuiChip-deleteIcon';
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
const RESTORE_BUTTONS = '[data-cy=restore-transaction-button]';
const SENDER_RECEIVER_ADDRESSES = '[data-cy=sender-receiver-address]';
const STREAM_FLOW_RATES = '[data-cy=flow-rate]';
const START_END_DATES = '[data-cy=start-end-date]';
const RAINBOWKIT_CLOSE_BUTTON = '[aria-label=Close]';
const TX_ERROR = '[data-cy=tx-error]';
const TRANSACTION_REJECTED_MESSAGE = 'Transaction Rejected';
// The Clear Macro relay's pre-signature fee gate (`ClearMacroInsufficientFeeError` in
// src/features/clearMacro/executeClearMacro.ts). Amounts and the fee token symbol differ
// per action and per network, so they are captured and asserted on rather than hardcoded.
//
// There are two message shapes and four remedy tails, all of which are legitimate:
//   * the Super-Token fee guard (executeClearMacro.ts:804-811)
//       "You need <req> <sym> to pay the fee, but you have <avail> <sym>. "
//       + "Top up <sym> to continue."                                        (relay required)
//       + "Top up <sym>, or turn off gasless sending to pay with gas instead." (opt-in)
//   * the Permit2 underlying-fee guard (executeClearMacro.ts:851-864), which says "cover"
//     rather than "pay", can fold the wrap amount into the required total, and has its
//     own two remedy tails
//       "You need <req> <sym> to cover the fee, but you have <avail> <sym>. "
//       "You need <req> <sym> to cover the amount you're wrapping plus the fee, but ..."
//       + "Top up <sym>, or pay the fee with the Super Token instead."        (relay required)
//       + "Top up <sym>, pay the fee with the Super Token instead, or turn off gasless sending."
//
// The symbol is a live `symbol()` read that falls back to the literal string
// "the fee token" when the call reverts (executeClearMacro.ts:802 and :848), so the symbol
// groups have to accept that two-space phrase as well as a normal ticker.
// Capture groups (named groups are unavailable at this tsconfig target):
//   1 = required fee, 2 = fee token symbol, 3 = available balance,
//   4 = balance token symbol, 5 = the symbol the user is told to top up.
const FEE_TOKEN_SYMBOL = String.raw`the fee token|[^\s.]+`;
const RELAY_FEE_GATE_MESSAGE = new RegExp(
  String.raw`^You need ([\d.]+) (${FEE_TOKEN_SYMBOL}) to ` +
    String.raw`(?:pay the fee|cover the fee|cover the amount you're wrapping plus the fee)` +
    String.raw`, but you have ([\d.]+) (${FEE_TOKEN_SYMBOL})\. ` +
    String.raw`Top up (the fee token|[^\s,.]+)(?:` +
    String.raw` to continue\.` +
    String.raw`|, or turn off gasless sending to pay with gas instead\.` +
    String.raw`|, or pay the fee with the Super Token instead\.` +
    String.raw`|, pay the fee with the Super Token instead, or turn off gasless sending\.` +
    String.raw`)$`
);
const CLOSE_BUTTON = '[data-cy=close-rounded-icon]';
const ACCESS_CODE_DIALOG = '[data-cy=access-code-dialog]';
const ACCESS_CODE_ERROR = '[data-cy=access-code-error]';
const ACCESS_CODE_MESSAGE = '[data-cy=access-code-error-msg]';
const VESTING_ACCESS_CODE_BUTTON = '[data-cy=more-vesting-code-btn]';
const STREAM_ROWS = '[data-cy=stream-row]';
const TIMER_ICONS = '[data-cy=scheduled-stream-icon]';
const FAUCET_BUTTON = '[data-cy=more-faucet-btn]';
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
const LOADING_SKELETONS = '.MuiSkeleton-root';
const ADDRESS_SEARCH_DIALOG = '[data-cy=receiver-dialog]';
const CONNECTED_WALLET_BUTTON = '[data-cy=connected-wallet-button]';
const CONNECTED_WALLET_DIALOG = '[data-cy=account-modal]';
const DISCONNECT_BUTTON = '[data-cy=disconnect-button]';
const ADDRESS_MODAL_COPY_BUTTON = '[data-cy=address-modal-copy-button]';
const COPY_ICON = '[data-cy=copy-icon]';
const CHECKMARK_ICON = '[data-cy=copied-checkmark-icon]';

const ADDRESS_SEARCH_AVATAR_IMAGES =
  '[role=dialog] [class*=MuiListItemAvatar] img';
const DARK_MODE_BUTTON = '[data-cy=dark-mode-button]';
const LIGHT_MODE_BUTTON = '[data-cy=light-mode-button]';
const DARK_MODE_ICON = '[data-cy=dark-mode-button]';
const LIGHT_MODE_ICON = '[data-cy=light-mode-button]';
const GET_SUPER_TOKENS_ONBOARDING_CARD = '[data-cy=get-tokens-onboarding-card]';
const SEND_STREAM_ONBOARDING_CARD = '[data-cy=send-stream-onboarding-card]';
const MODIFY_OR_CANCEL_STREAM_ONBOARDING_CARD =
  '[data-cy=modify-or-cancel-streams-onboarding-card]';
const TRY_SUPERFLUID_ONBOARDING_CARD =
  '[data-cy=try-out-superfluid-onboarding-card]';
const SUPERFLUID_RUNNER_NAV_LINK = '[data-cy=nav-superfluid-runner]';
const RECEIVER_BUTTON = '[data-cy=address-button]';
const RECENT_ENTRIES = '[data-cy=recents-entry]';
const TOKEN_SELECT_SYMBOL = '[data-cy=token-symbol-and-name] h6';
const TOKEN_SEARCH_INPUT = '[data-cy=token-search-input] input';
const TOKEN_NO_SEARCH_RESULTS = '[data-cy=token-search-no-results]';
const PREVIEW_BALANCE = '[data-cy=balance]';


export class Common extends BasePage {
  static validateEcosystemNavigationButtonHref() {
    cy.get('[data-cy=nav-ecosystem')
      .parent()
      .should('have.attr', 'href', 'https://superfluid.org/ecosystem');
    cy.get('[data-cy=nav-ecosystem')
      .parent()
      .should('have.attr', 'target', '_blank');
  }

  static validateSuperfluidRunnerLinkWithoutAddress() {
    cy.get(SUPERFLUID_RUNNER_NAV_LINK)
      .parent()
      .should('have.attr', 'target', '_blank')
      .invoke('attr', 'href')
      .should((href) => {
        expect(href).to.contain('https://astrobunny.superfluid.finance/?level=');
        expect(href).to.not.contain('address=');
      });
  }
  static validateSuperfluidRunnerLinkWithAddress(account: string) {
    cy.fixture('commonData').then((addresses) => {
      cy.get(SUPERFLUID_RUNNER_NAV_LINK)
        .parent()
        .should('have.attr', 'target', '_blank')
        .invoke('attr', 'href')
        .should((href) => {
          expect(href).to.contain(
            'https://astrobunny.superfluid.finance/?level='
          );
          // Case-insensitive: the address checksum casing depends on the connector.
          expect(href!.toLowerCase()).to.contain(
            `address=${addresses[account].toLowerCase()}`
          );
        });
    });
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
  static blockENSApiRequests() {
    // ENS/handle resolution now flows through the whois service, not the old mainnet RPC.
    cy.intercept('GET', 'https://whois.superfluid.finance/api/**', {
      forceNetworkError: true,
    });
  }

  static validateErrorShownInRecepientList(serviceType: string) {
    // whois swallows lookup failures to a null result, so a blocked/failed resolution
    // surfaces as the graceful "No results found" state rather than a `<service>-error` element.
    cy.contains('No results found').should('be.visible');
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

  static validateLensImageIsLoaded(account: string) {
    cy.fixture('ensAndLensAvatarUrls').then((urls) => {
      cy.get(ADDRESS_SEARCH_AVATAR_IMAGES, { timeout: 60000 })
        .should('have.attr', 'src', urls[account])
        .and('be.visible');
    });
  }
  static clickOnFirstLensEntry() {
    this.click('[data-cy=whois-entry]', 0);
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
        // Seeded here rather than in a Before hook so it lands in the application window
        // before redux-persist rehydrates. See the @gaslessRelayEnabled hook for why.
        if (Cypress.env('gaslessRelayEnabled')) {
          window.localStorage.setItem(
            'persist:appSettings',
            // redux-persist stores each field JSON-stringified and merges over `initialState`,
            // so only the field under test has to be present here.
            '{"clearMacroEnabled":"true","_persist":"{\\"version\\":1,\\"rehydrated\\":true}"}'
          );
        }
        try {
          const normalizedKey = (
            usedAccountPrivateKey.startsWith('0x')
              ? usedAccountPrivateKey
              : `0x${usedAccountPrivateKey}`
          ) as `0x${string}`;
          const account = privateKeyToAccount(normalizedKey);

          // Minimal viem chain definition for the selected network.
          const chain = {
            id: chainId,
            name: selectedNetwork,
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: [networkRpc] } },
          } as const;

          const transport = http(networkRpc);
          const publicClient = createPublicClient({ chain, transport });
          const walletClient = createWalletClient({ account, chain, transport });

          const SIGNING_METHODS = [
            'eth_sendTransaction',
            'wallet_sendTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
            'eth_signTypedData_v3',
            'eth_signTypedData_v4',
          ];
          const NUMERIC_TX_FIELDS = [
            'value',
            'gas',
            'gasPrice',
            'maxFeePerGas',
            'maxPriorityFeePerGas',
            'maxFeePerBlobGas',
          ];

          // viem-native EIP-1193 mock: signs locally with the test key and
          // forwards reads to the RPC. Replaces @truffle/hdwallet-provider,
          // which rejected viem 2.x's eth_sendTransaction shape (so viem fell
          // back to wallet_sendTransaction, which the node can't service).
          const mockBridge = {
            request: async ({
              method,
              params,
            }: {
              method: string;
              params?: any[];
            }) => {
              if (Cypress.env('rejected') && SIGNING_METHODS.includes(method)) {
                // Real wallets reject with EIP-1193 code 4001 → viem
                // UserRejectedRequestError → app maps to "Transaction Rejected".
                throw Object.assign(new Error('User rejected the request.'), {
                  code: 4001,
                });
              }
              switch (method) {
                case 'eth_requestAccounts':
                case 'eth_accounts':
                  return [account.address];
                case 'eth_chainId':
                  return numberToHex(chainId);
                case 'wallet_sendTransaction':
                case 'eth_sendTransaction': {
                  const tx: any = { ...(params?.[0] ?? {}) };
                  delete tx.from;
                  delete tx.type;
                  for (const f of NUMERIC_TX_FIELDS)
                    if (tx[f] != null) tx[f] = BigInt(tx[f]);
                  if (tx.nonce != null) tx.nonce = Number(BigInt(tx.nonce));
                  // OP Sepolia rejects estimateGas with the default (block-limit)
                  // gas cap as "intrinsic gas too high" (L1-fee gas inflates it).
                  // Real wallets pass a sane cap; a local-key viem account does
                  // not — so when the app didn't pin a limit, estimate with an
                  // explicit cap here and set it, so viem just signs+broadcasts.
                  if (tx.gas == null) {
                    const estParams: any = {
                      from: account.address,
                      to: tx.to,
                      data: tx.data,
                      gas: numberToHex(8000000),
                    };
                    if (tx.value != null) estParams.value = numberToHex(tx.value);
                    tx.gas = BigInt(
                      await publicClient.request({
                        method: 'eth_estimateGas',
                        params: [estParams],
                      })
                    );
                  }
                  return await walletClient.sendTransaction({
                    account,
                    chain,
                    ...tx,
                  });
                }
                case 'personal_sign':
                  return await account.signMessage({
                    message: { raw: params?.[0] },
                  });
                case 'eth_sign':
                  return await account.signMessage({
                    message: { raw: params?.[1] },
                  });
                case 'eth_signTypedData':
                case 'eth_signTypedData_v3':
                case 'eth_signTypedData_v4': {
                  const raw = params?.[1];
                  const typed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                  return await account.signTypedData(typed);
                }
                default:
                  return await publicClient.request({
                    method: method as any,
                    params: params as any,
                  });
              }
            },
            on: () => {},
            removeListener: () => {},
            emit: () => {},
          };

          window['mockBridge'] = mockBridge;
          window['mockWallet'] = {
            chainId,
            getAddress: () => account.address,
          };
          window['mockWalletDebug'] = {
            chainId,
            network: selectedNetwork,
            address: account.address,
          };
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
    cy.log('Cypress will reject wallet transactions!');
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

  // The token-page distributions tab queries index subscriptions via sdk-redux,
  // whose generated query aliases the `indexSubscriptions` field to `result`.
  // Match the request by its query body (the operationName varies) and empty the
  // result so the no-data row shows regardless of the account's real on-chain
  // state. (`mockQueryToEmptyState` can't be reused: it writes `data[operationName]`,
  // not the aliased `result`.)
  static mockIndexSubscriptionsToEmptyState() {
    cy.intercept('POST', '**subgraph**', (req) => {
      const query = (req.body && req.body.query) || '';
      if (query.includes('indexSubscriptions')) {
        req.alias = 'indexSubscriptionsQuery';
        req.continue((res) => {
          if (res.body && res.body.data) {
            if (Array.isArray(res.body.data.result)) res.body.data.result = [];
            if (Array.isArray(res.body.data.indexSubscriptions))
              res.body.data.indexSubscriptions = [];
          }
        });
      }
    });
  }

  // The receiver dialog's "Recents" come from the live `recents` subgraph query
  // (maps response.streams -> receiver.id). Mock it to a deterministic receiver so the
  // scenario doesn't depend on the account's live stream history. Register before opening
  // the dialog. Subgraph addresses are lowercase; the app checksums them for display.
  static mockRecentsToKnownReceiver() {
    cy.intercept('POST', '**subgraph**', (req) => {
      const query = (req.body && req.body.query) || '';
      if (req.body?.operationName === 'recents' || query.includes('query recents')) {
        req.alias = 'recentsQuery';
        req.reply({
          data: {
            streams: [
              { receiver: { id: '0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2' } },
            ],
          },
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
      TRANSACTION_REJECTED_MESSAGE
    );
  }

  /**
   * Assert the Clear Macro relay fee gate, unconditionally.
   *
   * When a wallet cannot cover the relay fee, the app blocks *before* requesting a
   * signature and explains the shortfall. That is intended product behaviour, and it
   * gets its own scenario against a deliberately unfunded account rather than being
   * folded into the rejection scenarios as an either/or -- a test that accepts two
   * different outcomes cannot tell you which one it saw, and would have gone green if
   * the fee gate started firing for funded wallets too.
   *
   * The scenarios that exercise the signature-rejection path keep asserting
   * `transactionRejectedErrorIsShown` strictly; their wallet is funded with the fee
   * token so they always reach the signature prompt.
   *
   * Known limit, deliberately not papered over: the numbers checked here are parsed
   * out of the message itself, so this proves the gate is well-formed and internally
   * consistent, not that the balance it quotes is the wallet's real balance. Asserting
   * that would need an independent on-chain read of the fee token
   * (see cypress/support/helpers/liveBalances.ts).
   */
  static relayFeeGateErrorIsShown() {
    cy.get(TX_ERROR, { timeout: 60000 })
      .should(($alert) => {
        const text = $alert.text().trim();
        expect(
          RELAY_FEE_GATE_MESSAGE.test(text),
          `Expected the Clear Macro relay fee gate ("You need <amount> <symbol> to pay/cover the fee, ` +
            `but you have <amount> <symbol>. Top up ..."), but the dialog showed: "${text}"`
        ).to.equal(true);
      })
      .invoke('text')
      .then((rawText: string) => {
        const text = rawText.trim();
        const match = RELAY_FEE_GATE_MESSAGE.exec(text);
        expect(match, `Failed to parse the relay fee gate message: "${text}"`).to
          .not.be.null;
        const required = (match as RegExpExecArray)[1];
        const requiredSymbol = (match as RegExpExecArray)[2];
        const available = (match as RegExpExecArray)[3];
        const availableSymbol = (match as RegExpExecArray)[4];
        const topUpSymbol = (match as RegExpExecArray)[5];

        cy.log(
          `Clear Macro relay fee gate shown: needs ${required} ${requiredSymbol}, wallet holds ${available} ${availableSymbol}.`
        );

        expect(
          Number(required),
          'The relay fee gate must quote a non-zero required fee'
        ).to.be.greaterThan(0);
        expect(
          Number(available),
          'The relay fee gate must only be shown when the balance is actually short of the required fee'
        ).to.be.lessThan(Number(required));
        expect(
          availableSymbol,
          'The relay fee gate must compare the balance in the same token as the fee'
        ).to.equal(requiredSymbol);
        expect(
          topUpSymbol,
          'The relay fee gate must tell the user to top up the fee token'
        ).to.equal(requiredSymbol);
      });
  }

  static validateNoEthereumMainnetShownInDropdown() {
    this.doesNotExist('[data-cy=ethereum-button]');
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

    // `selector` is the picker field's data-cy container, not its input: under the
    // MUI X v9 accessible field DOM the only <input> is a hidden mirror that cannot
    // be typed into, so the whole value is written through it natively in a single
    // command (see setPickersFieldValue). This also keeps the no-clear() rule from
    // v8: clearing re-renders the scheduling form and detaches the element
    // mid-command on slower CI, and a {selectall}{del} prefix only ever cleared one
    // section -- writing the full formatted value overwrites every section at once.
    this.setPickersFieldValue(selector, finalFutureDate);
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
          'approvals page': '/approvals',
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
          // The recents-entry (AddressListItem) renders a name + the shortened address,
          // never the full 42-char address — match the shortened form on the indexed row.
          cy.get(RECENT_ENTRIES)
            .eq(index)
            .should('contain.text', this.shortenHex(receiver.address, 6));
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
