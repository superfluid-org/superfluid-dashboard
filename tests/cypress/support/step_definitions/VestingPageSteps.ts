import {Given,Then} from "@badeball/cypress-cucumber-preprocessor";
import {VestingPage} from "../../pageObjects/pages/VestingPage";

Then(/^No received vesting schedules message is shown$/, function () {
    VestingPage.validateNoReceivedVestingScheduleMessage()
});
Then(/^No created vesting schedules message is shown$/, function () {
    VestingPage.validateNoCreatedVestingScheduleMessage()
});
Given(/^User clicks on the create vesting schedule button$/, function () {
    VestingPage.clickCreateScheduleButton()
});
Then(/^"([^"]*)" error is shown in the form$/, function (error:string) {
    VestingPage.validateFormError(error)
});
Given(/^User inputs a date "(\d+)" "([^"]*)" into the future into the vesting start date field$/, function (amount:number,timeUnit:string) {
    VestingPage.inputFutureDateInVestingStartDateField(amount,timeUnit)
});
Given(/^User inputs "(\d+)" as the cliff amount$/, function (amount:number) {
    VestingPage.inputCliffAmount(amount)
});
Given(/^User inputs "(\d+)" "([^"]*)" as the cliff period$/, function (amount:number , timeUnit:string) {
    VestingPage.inputCliffPeriod(amount,timeUnit)
});
Given(/^User inputs "(\d+)" as the total vested amount$/, function (amount:number) {
    VestingPage.inputTotalVestedAmount(amount)
});
Given(/^User inputs "(\d+)" "([^"]*)" as the total vesting period$/, function (amount:number , timeUnit:string) {
    VestingPage.inputTotalVestingPeriod(amount,timeUnit)
});
Given(/^User inputs valid vesting schedule details in the form and proceeds to the preview$/, function () {
    VestingPage.inputFutureDateInVestingStartDateField(1,"year")
    VestingPage.clickCliffToggle()
    VestingPage.inputCliffAmount(1)
    VestingPage.inputCliffPeriod(1,"year")
    VestingPage.inputTotalVestedAmount(2)
    VestingPage.inputTotalVestingPeriod(2,"year")
    VestingPage.clickPreviewButton()
});
Given(/^User deletes the vesting schedule if necessary$/, function () {
    VestingPage.deleteScheduleIfNecessary()
});
Given(/^Preview of the vesting schedule is shown correctly$/, function () {
    VestingPage.validateVestingSchedulePreview()
});
Given(/^User creates the vesting schedule$/, function () {
    VestingPage.createNewVestingSchedule()
});
Given(/^The newly created vesting schedule is visible in the table$/, function () {
    VestingPage.validateNewlyCreatedSchedule()
});
Then(/^The first vesting row in the table shows "([^"]*)" pending transaction status$/, function (status:string) {
    VestingPage.validateFirstRowPendingStatus(status)
});
Given(/^User opens the last vesting schedule they have created$/, function () {
    VestingPage.openLastCreatedSchedule()
});
Given(/^User deletes the vesting schedule$/, function () {
    VestingPage.deleteVestingSchedule()
});
Given(/^Delete vesting schedule button is not visible$/, function () {
    VestingPage.deleteVestingButtonDoesNotExist()
});
Given(/^Change to goerli button is visible in the vesting preview$/, function () {
    VestingPage.changeNetworkButtonIsVisible()
});
Given(/^User clicks on the change to goerli button$/, function () {
    VestingPage.clickChangeNetworkButton()
});
Given(/^Delete vesting schedule button is visible$/, function () {
    VestingPage.deleteVestingScheduleButtonIsVisible()
});
Given(/^The created vesting schedule is shown correctly in the table$/, function () {
    VestingPage.validateCreatedVestingSchedule()
});
Given(/^Vesting details page is shown correctly for the created schedule$/, function () {
    VestingPage.validateCreatedVestingScheduleDetailsPage()
});
Then(/^User sees network not supported screen in the vesting page$/, function () {
    VestingPage.validateNotSupportedNetworkScreen()
});
Then(/^Mainnet network link is disabled$/, function () {
    VestingPage.validateDisabledMainnetNetworkLink()
});
Then(/^Mainnet network link is enabled$/, function () {
    VestingPage.validateEnabledMainnetNetworkLink()
});
Given(/^"([^"]*)" permissions icons are all "([^"]*)"$/, function (token:string,color:string) {
    VestingPage.validateTokenPermissionIcons(token,color)
});
Given(/^User opens "([^"]*)" permission table row$/, function (token:string) {
    VestingPage.openTokenPermissionRow(token)
});
Then(/^All current and recommended permissions are correctly showed for "([^"]*)"$/, function (token:string) {
    VestingPage.validateTokenPermissionsData(token)
});
Given(/^User clicks on the cliff date toggle$/, function () {
    VestingPage.clickCliffToggle()
});
Given(/^Vesting schedule status is mocked to (.*)$/, function (status:string) {
    VestingPage.mockScheduleToStatus(status)
});
Then(/^The first vesting row in the table shows (.*)$/, function (status:string) {
    VestingPage.validateVestingRowStatus(status)
});
Then(/^The schedule bar is correctly shown when it is in (.*)$/, function (status:string) {
    VestingPage.validateScheduleBar(status)
});
Given(/^Vesting schedule progress is mocked to (.*)$/, function (status:string) {
    VestingPage.mockProgressTo(status)
});
Then(/^Total stats for the sent vesting schedules are shown correctly$/, function () {
    VestingPage.validateAggregateStats()
});
Then(/^Unlock Vesting with Superfluid screen is visible$/, function () {
    VestingPage.validateNoCodeUnlockScreen()
});
Then(/^User tries out vesting on Mumbai testnet$/, function () {
    VestingPage.clickOnTryOnMumbaiButton()
});
Then(/^User clicks on the input access code button$/, function () {
    VestingPage.clickInputAccessCodeButton()
});
Given(/^Vesting creation form is visible$/, function () {
    VestingPage.validateVestingFormIsVisible()
});
Then(/^The top\-up warning message without cliff is shown$/, function () {
    VestingPage.validateTopUpMessageWithoutCliff()
});
Then(/^The top\-up warning message when cliff is enabled is shown$/, function () {
    VestingPage.validateTopUpMessageWithCliff()
});