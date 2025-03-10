import { BasePage, wordTimeUnitMap } from '../BasePage';
import { format } from 'date-fns';
import { SendPage } from './SendPage';
import {
  Common,
  CHANGE_NETWORK_BUTTON,
  CONNECT_WALLET_BUTTON,
  STOP_VIEWING_BUTTON,
} from './Common';
import { networksBySlug } from '../../superData/networks';

const NO_CREATED_TITLE = '[data-cy=no-created-schedules-title]';
const NO_CREATED_DESC = '[data-cy=no-created-schedules-description]';
const NO_RECEIVED_TITLE = '[data-cy=no-received-schedules-title]';
const NO_RECEIVED_DESC = '[data-cy=no-received-schedules-description]';
const CREATED_TABLE = '[data-cy=created-table]';
const RECEIVED_TABLE = '[data-cy=received-table]';
const FORM_ERROR = '.MuiAlert-message';
const CREATE_VESTING_SCHEDULE_BUTTON = '[data-cy=create-schedule-button]';
const PREVIEW_SCHEDULE_BUTTON = '[data-cy=preview-schedule-button]';
const DATE_INPUT = '[data-cy=date-input] input';
const CLIFF_AMOUNT_INPUT = '[data-cy=cliff-amount-input] input';
const CLIFF_PERIOD_INPUT = '[data-cy=cliff-period-input] input';
const CLIFF_PERIOD_UNIT = '[data-cy=cliff-period-unit]';
const CLIFF_PERIOD_SELECTED_UNIT = `${CLIFF_PERIOD_UNIT} div`;
const TOTAL_AMOUNT_INPUT = '[data-cy=total-amount-input] input';
const TOTAL_PERIOD_INPUT = '[data-cy=total-period-input] input';
const TOTAL_PERIOD_UNIT = '[data-cy=total-period-unit]';
const TOTAL_PERIOD_SELECTED_UNIT = `${TOTAL_PERIOD_UNIT} div`;
const LOADING_SKELETONS = '[class*=MuiSkeleton]';
const DELETE_SCHEDULE_BUTTON = '[data-cy=delete-schedule-button]';
const FORWARD_BUTTON = '[data-testid=ArrowForwardIcon]';
const BACK_BUTTON = '[data-testid=ArrowBackIcon]';
const VESTING_ROWS = '[data-cy=vesting-row]';
const OK_BUTTON = '[data-cy=ok-button]';
const TX_DRAWER_BUTTON = '[data-cy=tx-drawer-button]';
const GRAPH_CLIFF_DATE = '[data-cy=graph-cliff-date]';
const GRAPH_START_DATE = '[data-cy=graph-start-date]';
const GRAPH_END_DATE = '[data-cy=graph-end-date]';
const CREATE_SCHEDULE_TX_BUTTON = '[data-cy=create-schedule-tx-button]';
const PREVIEW_RECEIVER = '[data-cy=preview-receiver]';
const PREVIEW_START_DATE = '[data-cy=preview-start-date]';
const PREVIEW_CLIFF_AMOUNT = '[data-cy=preview-cliff-amount]';
const PREVIEW_CLIFF_PERIOD = '[data-cy=preview-cliff-period]';
const PREVIEW_TOTAL_AMOUNT = '[data-cy=preview-total-amount]';
const PREVIEW_TOTAL_PERIOD = '[data-cy=preview-total-period]';
const APPROVAL_MESSAGE = '[data-cy=approval-message]';
const TABLE_ALLOCATED_AMOUNT = '[data-cy=allocated-amount]';
const VESTED_AMOUNT = '[data-cy=vested-amount]';
const TABLE_START_END_DATES = '[data-cy=start-end-dates]';
const TABLE_VESTING_STATUS = '[data-cy=vesting-status]';
const TABLE_RECEIVER_SENDER = '[data-cy=receiver-sender]';
const PENDING_MESSAGE = '[data-cy=pending-message]';
const NOT_SUPPORTED_NETWORK_MSG = '[data-cy=not-supported-network-msg]';
const MAINNET_NETWORK_LINK = '[data-cy=ethereum-link]';
const CLIFF_TOGGLE = '[data-cy=cliff-toggle]';
const DETAILS_SCHEDULED_DATE = '[data-cy=vesting-scheduled-date]';
const DETAILS_CLIFF_START = '[data-cy=cliff-start-date]';
const DETAILS_CLIFF_END = '[data-cy=cliff-end-date]';
const DETAILS_VESTING_START = '[data-cy=vesting-start-date]';
const DETAILS_VESTING_END = '[data-cy=vesting-end-date]';
const DETAILS_VESTED_SO_FAR_AMOUNT = '[data-cy=balance]';
const DETAILS_VESTED_TOKEN_SYMBOL = '[data-cy=token-symbol]';
const SCHEDULE_VESTING_SCHEDULED = '[data-cy=vesting-scheduled]';
const SCHEDULE_CLIFF_START = '[data-cy=vesting-start]';
const SCHEDULE_CLIFF_END = '[data-cy=cliff-end]';
const SCHEDULE_VESTING_START = '[data-cy=vesting-start]';
const SCHEDULE_VESTING_END = '[data-cy=vesting-end]';
const ACCESS_CODE_BUTTON = '[data-cy=vesting-code-button]';
const TRY_OP_SEPOLIA_BUTTON = '[data-cy=opsepolia-link]';
const TOPUP_WARNING_TITLE = '[data-cy=top-up-alert-title]';
const TOPUP_WARNING_TEXT = '[data-cy=top-up-alert-text]';
const ALLOWLIST_MESSAGE = '[data-cy=allowlist-message]';
const ALLOWLIST_LINK = '[data-cy=allowlist-link]';
const AUTO_WRAP_SWITCH_AND_TOOLTIP = '[data-cy=auto-wrap-switch-and-tooltip]';
const AUTO_WRAP_SWITCH = '[data-cy=auto-wrap-switch]';
const AUTO_WRAP_ENABLE_BUTTON = '[data-cy=enable-auto-wrap-button]';
const AUTO_WRAP_ALLOWANCE_BUTTON = '[data-cy=auto-wrap-allowance-button]';
const AUTO_WRAP_TOOLTIP = `${AUTO_WRAP_SWITCH_AND_TOOLTIP} svg`;
const AUTO_WRAP_TX_MESSAGE = '[data-cy=auto-wrap-tx-message]';
const TX_MESSAGE_NETWORK = '[data-cy=tx-network]';
const AUTO_WRAP_DIALOG = '[data-cy=auto-wrap-enable-dialog]';
const DISABLE_AUTO_WRAP_BUTTON = '[data-cy=disable-auto-wrap-button]';
const FIX_PERMISSIONS_BUTTON = '[data-cy=fix-permissions-button]';
const VIEW_DASHBOARD_AS_ANY_ADDRESS_BUTTON =
  '[data-cy=view-mode-inputs] button';
const VESTING_FORM_LINK = '[data-cy=vesting-form-link]';

//Strings
const NO_CREATED_TITLE_STRING = 'No Sent Vesting Schedules';
const NO_CREATED_DESC_STRING =
  'Vesting schedules that you have created will appear here.';
const NO_RECEIVED_TITLE_STRING = 'No Received Vesting Schedules';
const NO_RECEIVED_DESC_STRING =
  'Vesting schedules that you have received will appear here.';
const VERSION_V2 = '[data-cy=version-v2]';
const REQUIRE_RECEIVER_TO_CLAIM = '[data-cy=claim-toggle]';
const VESTING_STATUS = '[data-cy=vesting-status]';

//Dates for the vesting previews etc.
let staticStartDate = new Date(1898252700000);
let staticEndDate = new Date(2056021500000);
let currentTime = new Date();
let startDate = new Date(
  currentTime.getTime() + wordTimeUnitMap['year'] * 1000
);
let cliffDate = new Date(startDate.getTime() + wordTimeUnitMap['year'] * 1000);
let endDate = new Date(
  startDate.getTime() + 2 * (wordTimeUnitMap['year'] * 1000)
);

export class VestingPage extends BasePage {
  static validateNoFixPermissionsButtonExists() {
    this.doesNotExist(FIX_PERMISSIONS_BUTTON);
  }
  static validateNoDisableAutoWrapButtonVisible() {
    this.isNotVisible(DISABLE_AUTO_WRAP_BUTTON);
  }
  static clickEnableAutoWrapButtonInAutoWrapDialog() {
    this.clickFirstVisible(`${AUTO_WRAP_DIALOG} ${AUTO_WRAP_ENABLE_BUTTON}`);
  }
  static clickPermissionsTableAutoWrapEnableButton() {
    this.clickFirstVisible(AUTO_WRAP_ENABLE_BUTTON);
  }

  static validateAutoWrapSwitchNetworkButtonForToken(token: string) {
    this.isVisible(
      `[data-cy=${token}-row] + .MuiTableRow-root ${CHANGE_NETWORK_BUTTON}`
    );
  }
  static validateAutoWrapDialogShowingTokenAllowanceButton() {
    this.isVisible(AUTO_WRAP_ALLOWANCE_BUTTON);
    this.isNotVisible(`${AUTO_WRAP_DIALOG} ${AUTO_WRAP_ENABLE_BUTTON}`);
  }
  static clickDisableAutoWrapInPermissionsTable() {
    this.click(DISABLE_AUTO_WRAP_BUTTON);
  }
  static validateFixPermissionSwitchNetworkButton() {
    this.doesNotExist(FIX_PERMISSIONS_BUTTON);
    this.isVisible(CHANGE_NETWORK_BUTTON);
  }

  static validateStopViewingPermissionsTableAutoWrapButton(token: string) {
    this.isVisible(`[data-cy=${token}-row] + * ${STOP_VIEWING_BUTTON}`);
  }
  static validateNotConnectedScreen() {
    this.isVisible(CONNECT_WALLET_BUTTON);
    this.isVisible(VIEW_DASHBOARD_AS_ANY_ADDRESS_BUTTON);
    cy.contains('No Vesting Schedules Available').should('be.visible');
    cy.contains('Received and Sent Vesting Schedules will appear here.').should(
      'be.visible'
    );
    this.isVisible(VESTING_FORM_LINK);
  }
  static validateDisableAutoWrapButtonDoesNotExist() {
    this.doesNotExist(DISABLE_AUTO_WRAP_BUTTON);
  }
  static clickFixPermissionsButton() {
    this.click(FIX_PERMISSIONS_BUTTON);
  }
  static validateAutoWrapDialogShowingACLAllowanceButton() {
    this.isVisible(`${AUTO_WRAP_DIALOG} ${AUTO_WRAP_ENABLE_BUTTON}`);
  }

  static validatePermissionTableAutoWrapIcon(
    token: string,
    colorOrExisting: string
  ) {
    this.getSelectedToken(token).then((selectedToken) => {
      switch (colorOrExisting) {
        case 'not existing':
          this.doesNotExist(`[data-cy="${selectedToken}-auto-wrap-status"]`);
          break;
        case 'grey':
          this.hasCSS(
            `[data-cy="${selectedToken}-auto-wrap-status"]`,
            'color',
            'rgba(130, 146, 173, 0.26)',
            undefined,
            { timeout: 30000 }
          );
          break;
        case 'green':
          this.hasCSS(
            `[data-cy="${selectedToken}-auto-wrap-status"]`,
            'color',
            'rgb(16, 187, 53)',
            undefined,
            { timeout: 30000 }
          );
      }
    });
  }

  static clickAutoWrapAllowanceButton() {
    this.clickFirstVisible(AUTO_WRAP_ALLOWANCE_BUTTON);
  }
  static validateNoAllowanceAutoWrapButton() {
    this.doesNotExist(AUTO_WRAP_ALLOWANCE_BUTTON);
  }

  static validateAutoWrapSwitchIsVisible() {
    this.isVisible(AUTO_WRAP_SWITCH_AND_TOOLTIP);
  }

  static validateNoEnableAutoWrapButtonVisible() {
    this.isNotVisible(AUTO_WRAP_ENABLE_BUTTON);
  }

  static clickEnableAutoWrap() {
    this.clickFirstVisible(AUTO_WRAP_ENABLE_BUTTON);
  }

  static validateAutoWrapAllowanceTxMessage(network: string) {
    this.hasText(APPROVAL_MESSAGE, 'Waiting for transaction approval...');
    this.hasText(TX_MESSAGE_NETWORK, `(${networksBySlug.get(network)?.name})`);
    this.hasText(
      AUTO_WRAP_TX_MESSAGE,
      `You are approving Auto-Wrap token allowance for the underlying token.`
    );
  }

  static validateAutoWrapTxMessage(token: string, network: string) {
    this.hasText(APPROVAL_MESSAGE, 'Waiting for transaction approval...');
    this.hasText(TX_MESSAGE_NETWORK, `(${networksBySlug.get(network)?.name})`);
    this.hasText(
      AUTO_WRAP_TX_MESSAGE,
      `You are enabling Auto-Wrap to top up your ${token} tokens when balance reaches low.`
    );
  }

  static validateFirstRowPendingStatus(status: string) {
    cy.get(VESTING_ROWS)
      .first()
      .find(PENDING_MESSAGE, { timeout: 60000 })
      .should('have.text', status);
  }

  static validateNoReceivedVestingScheduleMessage() {
    this.hasText(NO_RECEIVED_DESC, NO_RECEIVED_DESC_STRING);
    this.hasText(NO_RECEIVED_TITLE, NO_RECEIVED_TITLE_STRING);
    this.doesNotExist(RECEIVED_TABLE);
  }

  static validateNoCreatedVestingScheduleMessage() {
    this.hasText(NO_CREATED_DESC, NO_CREATED_DESC_STRING);
    this.hasText(NO_CREATED_TITLE, NO_CREATED_TITLE_STRING);
    this.doesNotExist(CREATED_TABLE);
  }

  static createNewVestingSchedule() {
    SendPage.overrideNextGasPrice();
    this.click(CREATE_SCHEDULE_TX_BUTTON);
    this.hasText(APPROVAL_MESSAGE, 'Waiting for transaction approval...');
    // cy.get(OK_BUTTON, {timeout: 45000}).should("be.visible").click()
    // this.click(TX_DRAWER_BUTTON)
    // WrapPage.validatePendingTransaction("Create Vesting Schedule" , "avalanche-fuji")
  }

  static validateFormError(error: string) {
    this.hasText(FORM_ERROR, error, 0);
    this.isDisabled(PREVIEW_SCHEDULE_BUTTON);
  }

  static inputFutureDateInVestingStartDateField(
    amount: number,
    timeUnit: string
  ) {
    Common.inputDateIntoField(DATE_INPUT, amount, timeUnit);
  }

  static inputCliffAmount(amount: number) {
    this.type(CLIFF_AMOUNT_INPUT, amount);
  }

  static inputCliffPeriod(amount: number, timeUnit: string) {
    this.type(CLIFF_PERIOD_INPUT, amount);
    //Workaround for a race condition which leaves the preview button enabled after inputting cliff amounts too fast
    Common.wait(2);
    this.click(CLIFF_PERIOD_UNIT);
    if (wordTimeUnitMap[timeUnit] === undefined) {
      throw new Error(`Invalid time unit: ${timeUnit}`);
    }
    //Workaround for a race condition which leaves the preview button enabled after inputting cliff amounts too fast
    Common.wait(2);
    this.click(`[data-value=${wordTimeUnitMap[timeUnit]}]`);
    this.hasText(CLIFF_PERIOD_SELECTED_UNIT, `${timeUnit}(s)`);
  }

  static inputTotalVestedAmount(amount: number) {
    this.type(TOTAL_AMOUNT_INPUT, amount);
  }

  static inputTotalVestingPeriod(amount: number, timeUnit: string) {
    this.type(TOTAL_PERIOD_INPUT, amount);
    this.click(TOTAL_PERIOD_UNIT);
    if (wordTimeUnitMap[timeUnit] === undefined) {
      throw new Error(`Invalid time unit: ${timeUnit}`);
    }
    this.click(`[data-value=${wordTimeUnitMap[timeUnit]}]`);
    this.hasText(TOTAL_PERIOD_SELECTED_UNIT, `${timeUnit}(s)`);
  }

  static clickPreviewButton() {
    this.isNotDisabled(PREVIEW_SCHEDULE_BUTTON);
    this.click(PREVIEW_SCHEDULE_BUTTON);
  }

  static deleteScheduleIfNecessary() {
    SendPage.overrideNextGasPrice();
    this.doesNotExist(LOADING_SKELETONS);
    cy.get('body').then((body) => {
      if (body.find(FORWARD_BUTTON).length > 0) {
        this.clickFirstVisible(VESTING_ROWS);
        this.clickFirstVisible(DELETE_SCHEDULE_BUTTON);
        this.isVisible(OK_BUTTON, undefined, { timeout: 45000 }).click();
        this.isNotVisible(`${TX_DRAWER_BUTTON} span`, undefined, {
          timeout: 60000,
        });
        this.doesNotExist(FORWARD_BUTTON);
        this.doesNotExist(VESTING_ROWS);
      }
    });
  }

  static validateVestingSchedulePreview() {
    this.hasText(PREVIEW_RECEIVER, 'vijay.eth');
    this.validateSchedulePreviewDetails(cliffDate, startDate, endDate);
    this.hasText(PREVIEW_TOTAL_AMOUNT, '2 fTUSDx');
    this.hasText(PREVIEW_CLIFF_AMOUNT, '1 fTUSDx');
    this.containsText(
      PREVIEW_CLIFF_PERIOD,
      `1 year (${format(cliffDate, 'LLLL d, yyyy')})`
    );
    this.containsText(
      PREVIEW_TOTAL_PERIOD,
      `2 year (${format(endDate, 'LLLL d, yyyy')})`
    );
  }

  static validateNewlyCreatedSchedule() {
    cy.get(TABLE_RECEIVER_SENDER).last().should('have.text', 'vijay.eth');
    this.hasText(TABLE_ALLOCATED_AMOUNT, '2 fTUSDx', 0);
    // this.hasText(VESTED_AMOUNT, '0 fTUSDx'); // Formatting issues
    this.hasText(
      TABLE_START_END_DATES,
      `${format(startDate, 'LLL d, yyyy HH:mm')}${format(
        endDate,
        'LLL d, yyyy HH:mm'
      )}`,
      0
    );
    this.hasText(VESTING_STATUS, 'Scheduled', 0);
  }

  static clickCreateScheduleButton() {
    this.isVisible(CREATED_TABLE, undefined, { timeout: 30000 });
    this.click(CREATE_VESTING_SCHEDULE_BUTTON);
  }

  static openLastCreatedSchedule() {
    this.doesNotExist(`${CREATED_TABLE} ${LOADING_SKELETONS}`, undefined, {
      timeout: 45000,
    });
    this.clickFirstVisible(VESTING_ROWS);
  }

  static openCreatedSchedule() {
    this.doesNotExist(`${CREATED_TABLE} ${LOADING_SKELETONS}`, undefined, {
      timeout: 45000,
    });
    this.click(VESTING_ROWS, 0);
  }

  static deleteVestingSchedule() {
    this.click(DELETE_SCHEDULE_BUTTON, undefined, { timeout: 30000 });
  }

  static deleteVestingButtonDoesNotExist() {
    this.doesNotExist(DELETE_SCHEDULE_BUTTON);
  }

  static clickChangeNetworkButton() {
    this.click(CHANGE_NETWORK_BUTTON);
  }

  static changeNetworkButtonIsVisible() {
    this.isVisible(CHANGE_NETWORK_BUTTON);
  }

  static deleteVestingScheduleButtonIsVisible() {
    this.isVisible(DELETE_SCHEDULE_BUTTON, undefined, { timeout: 30000 });
  }

  static validateCreatedVestingSchedule() {
    this.hasText(TABLE_VESTING_STATUS, 'Scheduled', 0);
    this.hasText(
      TABLE_RECEIVER_SENDER,
      this.shortenHex('0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2'),
      0
    );
    this.hasText(TABLE_ALLOCATED_AMOUNT, '60.87 fTUSDx', 0, { timeout: 30000 });
    this.hasText(VESTED_AMOUNT, '0  fTUSDx', 0);
    this.containsText(
      TABLE_START_END_DATES,
      format(staticStartDate, 'LLL d, yyyy'),
      0
    );
    this.containsText(
      TABLE_START_END_DATES,
      format(staticEndDate, 'LLL d, yyyy'),
      0
    );
  }

  static validateSchedulePreviewDetails(
    cliffDate: Date,
    startDate: Date,
    endDate: Date
  ) {
    //The graph goes up by 1-5 minutes if test is too slow in the form
    cy.get(GRAPH_CLIFF_DATE).then((el) => {
      let graphCliffTimestamp = Date.parse(el.text().replace('Cliff: ', ''));
      expect(graphCliffTimestamp).to.be.closeTo(cliffDate.getTime(), 300000);
    });
    cy.get(GRAPH_END_DATE).then((el) => {
      let graphCliffTimestamp = Date.parse(el.text().replace('End: ', ''));
      expect(graphCliffTimestamp).to.be.closeTo(endDate.getTime(), 300000);
    });
    cy.get(GRAPH_START_DATE).then((el) => {
      let graphCliffTimestamp = Date.parse(el.text().replace('Start: ', ''));
      expect(graphCliffTimestamp).to.be.closeTo(startDate.getTime(), 300000);
    });
  }

  static validateCreatedVestingScheduleDetailsPage() {
    this.hasText(DETAILS_VESTED_SO_FAR_AMOUNT, '0 ');
    this.hasText(DETAILS_VESTED_TOKEN_SYMBOL, 'fTUSDx');
    this.hasText('[data-cy=fTUSDx-cliff-amount]', '0fTUSDx');
    this.hasText('[data-cy=fTUSDx-allocated]', '60.87fTUSDx', undefined, {
      timeout: 30000,
    });
    cy.fixture('vestingData').then((data) => {
      let schedule = data['opsepolia'].fTUSDx.schedule;
      this.hasText(
        DETAILS_SCHEDULED_DATE,
        format(schedule.createdAt * 1000, 'MMM do, yyyy HH:mm')
      );
      // this.hasText(
      //   DETAILS_CLIFF_START,
      //   format(schedule.startDate * 1000, "MMM do, yyyy HH:mm")
      // );
      // this.hasText(
      //   DETAILS_CLIFF_END,
      //   format(schedule.cliffDate * 1000, "MMM do, yyyy HH:mm")
      // );
      this.hasText(
        DETAILS_VESTING_END,
        format(schedule.endDate * 1000, 'MMM do, yyyy HH:mm')
      );
    });
  }

  static validateNotSupportedNetworkScreen() {
    const supportedNetworks = [
      'ethereum',
      'polygon',
      'bsc',
      'gnosis',
      'opsepolia',
      'optimism',
      'arbitrum-one',
      'avalanche',
    ];
    this.hasText(NOT_SUPPORTED_NETWORK_MSG, 'This network is not supported.');
    supportedNetworks.forEach((network) => {
      this.isVisible(`[data-cy=${network}-link]`);
    });
    this.doesNotExist('[data-cy=avalanche-fuji-link]');
  }

  static validateDisabledMainnetNetworkLink() {
    this.isDisabled(MAINNET_NETWORK_LINK);
  }

  static validateEnabledMainnetNetworkLink() {
    this.isNotDisabled(MAINNET_NETWORK_LINK);
  }

  static validateTokenPermissionIcons(token: string, color: string) {
    let rgbValue = color === 'green' ? 'rgb(16, 187, 53)' : 'rgb(210, 37, 37)';
    this.hasCSS(
      `[data-cy=${token}-allowance-status]`,
      'color',
      rgbValue,
      undefined,
      { timeout: 120000 }
    );
    this.hasCSS(`[data-cy=${token}-permission-status]`, 'color', rgbValue);
    this.hasCSS(`[data-cy=${token}-flow-allowance-status]`, 'color', rgbValue);
  }

  static openTokenPermissionRow(token: string) {
    this.getSelectedToken(token).then((selectedToken) => {
      this.click(
        `[data-cy="${selectedToken}-row"] [data-testid=ExpandMoreRoundedIcon]`,
        undefined,
        { timeout: 120000 }
      );
    });
  }

  static validateTokenPermissionsData(token: string) {
    cy.fixture('vestingData').then((data) => {
      let selectedToken = data['opsepolia'][token];
      this.hasText(
        `[data-cy=${token}-current-allowance] p`,
        `${selectedToken.currentAllowances.tokenAllowance} ${token}`
      );
      this.hasText(
        `[data-cy=${token}-recommended-allowance] p`,
        `${selectedToken.recommendedAllowances.tokenAllowance} ${token}`
      );
      this.hasText(
        `[data-cy=${token}-current-permissions] p`,
        selectedToken.currentAllowances.operatorPermissions
      );
      this.hasText(
        `[data-cy=${token}-recommended-permissions] p`,
        selectedToken.recommendedAllowances.operatorPermissions
      );
      this.hasText(
        `[data-cy=${token}-current-flow-allowance] p`,
        `${selectedToken.currentAllowances.flowAllowance} ${token}/sec`
      );
      this.hasText(
        `[data-cy=${token}-recommended-flow-allowance] p`,
        `${selectedToken.recommendedAllowances.flowAllowance} ${token}/sec`
      );
    });
  }

  static clickCliffToggle() {
    this.click(CLIFF_TOGGLE);
    //Workaround for a race condition which leaves the preview button enabled after inputting cliff amounts too fast
    Common.wait(2);
  }

  static mockScheduleToStatus(status: string) {
    let today = BasePage.getDayTimestamp(0);
    let yesterday = BasePage.getDayTimestamp(-1);

    cy.intercept('POST', '**vesting-scheduler**', (req) => {
      req.continue((res) => {
        console.log(req.body);
        if (req.body.variables.where.sender) {
          let schedule = res.body.data.vestingSchedules[1];
          switch (status) {
            case 'Cancel Error':
              schedule.failedAt = today;
              schedule.endDateValidAt = yesterday;
              break;
            case 'Scheduled':
              //Scheduled in a few years, no need to modify the response
              break;
            case 'Vesting':
              schedule.cliffAndFlowExecutedAt = today;
              break;
            case 'Vested':
              schedule.endDate = yesterday;
              schedule.endExecutedAt = yesterday;
              break;
            case 'Cliff':
              schedule.cliffDate = yesterday;
              break;
            case 'Stream Error':
              schedule.cliffAndFlowExpirationAt = yesterday;
              break;
            case 'Overflow Error':
              schedule.endDate = yesterday;
              schedule.endExecutedAt = yesterday + 1;
              break;
            case 'Deleted':
              schedule.deletedAt = yesterday;
              break;
            case 'Transfer Error':
              schedule.didEarlyEndCompensationFail = true;
              break;
          }
        }
      });
    });
  }

  static validateVestingRowStatus(status: string) {
    let rowNo = 1;
    if (status === 'Deleted') {
      cy.get(TABLE_VESTING_STATUS).should('be.visible');
      cy.contains('Deleted').click();
      rowNo = 0;
    }
    this.hasText(TABLE_VESTING_STATUS, status, rowNo);
  }

  static validateScheduleBarElements(
    greenOnes: string[],
    greyOnes: string[],
    barPercentage: number
  ) {
    greenOnes.forEach((greenOne, i) => {
      this.hasCSS(
        `${greenOne} div div`,
        'background',
        'rgb(16, 187, 53) none repeat scroll 0% 0% / auto padding-box border-box'
      );
      if (greyOnes.length === 0 && i === greenOnes.length - 1) {
        return;
      }
      cy.get('[data-cy=total-progress-line]')
        .eq(i)
        .then((el) => {
          let expectedWidth =
            i === greenOnes.length - 1
              ? (el.width() / 100) * barPercentage
              : el.width();
          this.get('[data-cy=actual-progress-line]', i)
            .invoke('width')
            .should('be.closeTo', expectedWidth, 1);
          this.isVisible('[data-cy=actual-progress-line]', i);
        });
    });
    greyOnes.forEach((greyOne, i) => {
      if (greyOne) {
        this.hasCSS(
          `${greyOne} div div`,
          'background',
          'rgba(0, 0, 0, 0.12) none repeat scroll 0% 0% / auto padding-box border-box'
        );
      }
    });
  }

  static validateScheduleBar(status: string) {
    switch (status) {
      case 'Scheduled':
        this.validateScheduleBarElements(
          [SCHEDULE_VESTING_SCHEDULED],
          [SCHEDULE_VESTING_START, SCHEDULE_VESTING_END],
          50
        );
        break;
      case 'Vesting Started':
        this.validateScheduleBarElements(
          [SCHEDULE_VESTING_SCHEDULED, SCHEDULE_VESTING_START],
          [SCHEDULE_VESTING_END],
          50
        );
        break;
      case 'Cliff vested':
        this.validateScheduleBarElements(
          [SCHEDULE_VESTING_SCHEDULED, SCHEDULE_VESTING_START],
          [SCHEDULE_VESTING_END],
          100
        );
        break;
      case 'Vesting ended':
        this.validateScheduleBarElements(
          [
            SCHEDULE_VESTING_SCHEDULED,
            SCHEDULE_VESTING_START,
            SCHEDULE_VESTING_END,
          ],
          [],
          100
        );
        break;
      default:
        throw new Error(`Unknown schedule bar state: ${status}`);
    }
  }

  static mockProgressTo(status: string) {
    cy.intercept('POST', '**vesting-scheduler**', (req) => {
      req.continue((res) => {
        if (req.body.variables.id) {
          let schedule = res.body.data.vestingSchedule;
          switch (status) {
            case 'Scheduled':
              schedule.cliffAndFlowDate = this.getDayTimestamp(2);
              schedule.cliffAndFlowExecutedAt = null;
              schedule.cliffAndFlowExpirationAt =
                this.getDayTimestamp(2) + 1000;
              schedule.cliffDate = this.getDayTimestamp(2);
              schedule.createdAt = this.getDayTimestamp(-1);
              schedule.earlyEndCompensation = null;
              schedule.endDate = this.getDayTimestamp(3);
              schedule.endDateValidAt = this.getDayTimestamp(3) + 1000;
              schedule.endExecutedAt = null;
              schedule.failedAt = null;
              schedule.startDate = this.getDayTimestamp(1);
              break;
            case 'Vesting Started':
              //Vesting scheduled
              schedule.createdAt = this.getDayTimestamp(-2);
              //Cliff starts
              schedule.startDate = this.getDayTimestamp(-1);
              //Cliff Ends
              schedule.cliffDate = this.getDayTimestamp(1);
              //Vesting starts
              schedule.cliffAndFlowDate = this.getDayTimestamp(2);
              schedule.cliffAndFlowExecutedAt = null;
              schedule.cliffAndFlowExpirationAt =
                this.getDayTimestamp(2) + 1000;
              //Vesting ends
              schedule.endDate = this.getDayTimestamp(3);
              schedule.endDateValidAt = this.getDayTimestamp(3) + 1000;
              schedule.endExecutedAt = null;
              //Error states
              schedule.earlyEndCompensation = null;
              schedule.failedAt = null;
              break;
            case 'Cliff vested':
              //Vesting scheduled
              schedule.createdAt = this.getDayTimestamp(-3);
              //Cliff starts
              schedule.startDate = this.getDayTimestamp(-2);
              //Cliff Ends
              schedule.cliffDate = this.getDayTimestamp(-1);
              //Vesting starts
              schedule.cliffAndFlowDate = this.getDayTimestamp(-1);
              schedule.cliffAndFlowExecutedAt = this.getDayTimestamp(-1);
              schedule.cliffAndFlowExpirationAt =
                this.getDayTimestamp(-1) + 1000;
              //Vesting ends
              schedule.endDate = this.getDayTimestamp(1);
              schedule.endDateValidAt = this.getDayTimestamp(1) + 1000;
              schedule.endExecutedAt = null;
              //Error states
              schedule.earlyEndCompensation = null;
              schedule.failedAt = null;
              break;
            case 'Vesting ended':
              //Vesting scheduled
              schedule.createdAt = this.getDayTimestamp(-4);
              //Cliff starts
              schedule.startDate = this.getDayTimestamp(-3);
              //Cliff Ends
              schedule.cliffDate = this.getDayTimestamp(-2);
              //Vesting starts
              schedule.cliffAndFlowDate = this.getDayTimestamp(-2);
              schedule.cliffAndFlowExecutedAt = this.getDayTimestamp(-2);
              schedule.cliffAndFlowExpirationAt =
                this.getDayTimestamp(-2) + 1000;
              //Vesting ends
              schedule.endDate = this.getDayTimestamp(-1);
              schedule.endDateValidAt = this.getDayTimestamp(-1) + 1000;
              schedule.endExecutedAt = this.getDayTimestamp(-1);
              //Error states
              schedule.earlyEndCompensation = null;
              schedule.failedAt = null;
              break;
          }
        }
      });
    });
  }

  static validateAggregateStats() {
    cy.fixture('vestingData').then((data) => {
      let schedule = data.polygon.USDCx.schedule;
      let stream = data.polygon.USDCx.vestingStream;
      let totalVestedAmount = (
        schedule.cliffAmount / 1e18 +
        ((Date.now() - stream.startedAtUnix) * stream.flowRate) / 1e21
      )
        .toFixed(0)
        .toString()
        .substring(0, 8);
      this.hasText(
        `[data-cy="${stream.token.symbol}-total-allocated"]`,
        `${schedule.totalAllocated}${stream.token.symbol}`
      );
      this.containsText(
        `[data-cy="${stream.token.symbol}-total-vested"]`,
        totalVestedAmount
      );
    });
    this.hasText(`[data-cy=DAIx-total-allocated]`, `60.87DAIx`);
    this.containsText(`[data-cy=DAIx-total-vested]`, '0');
  }

  static validateAllowListMessage() {
    this.hasText(
      ALLOWLIST_MESSAGE,
      'You are not on the allow list.If you want to create vesting schedules, Apply for access or try it out on OP Sepolia.'
    );
    this.isVisible(ALLOWLIST_LINK);
    this.hasAttributeWithValue(
      ALLOWLIST_LINK,
      'href',
      'https://use.superfluid.finance/vesting'
    );
    this.isVisible(TRY_OP_SEPOLIA_BUTTON);
  }

  static clickOnTryOnOpSepoliaButton() {
    this.click(TRY_OP_SEPOLIA_BUTTON);
  }

  static clickInputAccessCodeButton() {
    this.click(ACCESS_CODE_BUTTON);
  }

  static validateVestingFormIsVisible() {
    this.isVisible(CLIFF_TOGGLE);
    this.isVisible(TOTAL_AMOUNT_INPUT);
    this.isVisible(TOTAL_PERIOD_INPUT);
    this.isVisible(PREVIEW_SCHEDULE_BUTTON);
  }

  static validateTopUpMessageWithoutCliff() {
    this.hasText(
      TOPUP_WARNING_TITLE,
      'Don’t forget to top up for the vesting schedule!'
    );
    this.hasText(
      TOPUP_WARNING_TEXT,
      'Remember to top up your Super Token balance in time for the vesting stream.'
    );
  }

  static validateTopUpMessageWithCliff() {
    this.hasText(
      TOPUP_WARNING_TITLE,
      'Don’t forget to top up for the vesting schedule!'
    );
    this.hasText(
      TOPUP_WARNING_TEXT,
      'Remember to top up your Super Token balance in time for the cliff amount and vesting stream.'
    );
  }

  static validateReceiverAddressBookNames(name: string) {
    cy.get(TABLE_RECEIVER_SENDER)
      .should('have.length.greaterThan', 1)
      .then(($list) => {
        const lastIndex = $list.length - 1;

        cy.get(TABLE_RECEIVER_SENDER).each((el, index) => {
          if (index !== 0 && index !== lastIndex) {
            expect(el.text()).to.eq(name);
          }
        });
      });
  }

  static validateDetailsPageSenderReceivers(
    senderOrReceiver,
    nameOrAddress: string
  ) {
    this.hasText(`[data-cy=${senderOrReceiver}-address]`, nameOrAddress);
  }

  static validateAutoWrapSwitchDoesNotExist() {
    this.doesNotExist(AUTO_WRAP_SWITCH_AND_TOOLTIP);
  }

  static validateNoTopUpWarningShown() {
    this.doesNotExist(TOPUP_WARNING_TEXT);
    this.doesNotExist(TOPUP_WARNING_TITLE);
  }
  static clickAutoWrapSwitch() {
    this.click(AUTO_WRAP_SWITCH);
  }

  static switchToV2() {
    this.click(VERSION_V2);
  }

  static requireReceiverToClaim() {
    this.click(REQUIRE_RECEIVER_TO_CLAIM);
  }
}
