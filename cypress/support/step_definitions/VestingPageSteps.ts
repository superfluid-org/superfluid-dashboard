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