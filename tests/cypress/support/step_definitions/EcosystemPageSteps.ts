import {Then} from "@badeball/cypress-cucumber-preprocessor";
import {EcosystemPage} from "../../pageObjects/pages/EcosystemPage";

Then(/^Projects that are "([^"]*)" are shown$/, (apps: string) => {
    EcosystemPage.validateProjectsBuiltOnSuperfluid(apps)
});
Then(/^Add an app button is visible$/, () => {
    EcosystemPage.validateAddAnAppButton()
});