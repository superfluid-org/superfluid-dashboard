import {BasePage} from "../BasePage";
import {
    OTHER_APPS_BUILT_ON_SUPERFLUID,
    AUTOMATE_CRYPTO_PAYROLL,
    SUPERFLUID_INTEGRATIONS,
    SUPPORTS_SUPER_TOKENS,
    AUTOMATE_CRYPTO_VESTING,
    INVEST_IN_REALTIME,
    BRIDGE_AND_EXCHANGE,
    ON_OFFRAMP,
    PLAY_WEB3_GAMES,
} from "../../superData/ecosystem";

const APP_NAMES = "[data-cy=app-name]"
const APP_DESCRIPTIONS = "[data-cy=app-description]"
const APP_LINKS = "[data-cy=app-link-button]"
const COMMING_SOON_CHIPS = "[data-cy=app-comming-soon]"
const ADD_AN_APP_BUTTON = "[data-cy=add-new-app-button]"
const SECTION_TITLES = "[data-cy=section-title]"
const ADD_APP_LINK = "https://github.com/superfluid-finance/ecosystem/"

export class EcosystemPage extends BasePage {

    static validateProjectsBuiltOnSuperfluid(apps: string) {
        let testableApps;
        let sectionTitle;
        switch (apps) {
            case "built on superfluid":
                testableApps = OTHER_APPS_BUILT_ON_SUPERFLUID;
                sectionTitle = "Other Apps Built on Superfluid"
                break;
            case "have integrated superfluid":
                testableApps = SUPERFLUID_INTEGRATIONS;
                sectionTitle = "Integrations"
                break;
            case "supporting super tokens":
                testableApps = SUPPORTS_SUPER_TOKENS;
                sectionTitle = "Supports Super Tokens"
                break;
            case "automating crypto payroll":
                testableApps = AUTOMATE_CRYPTO_PAYROLL;
                sectionTitle = "Automate Crypto Payroll"
                break;
            case "automating crypto vesting":
                testableApps = AUTOMATE_CRYPTO_VESTING;
                sectionTitle = "Automate Crypto Vesting"
                break;
            case "investing in real time":
                testableApps = INVEST_IN_REALTIME;
                sectionTitle = "Invest in Real-Time"
                break;
            case "bridges and exchanges":
                testableApps = BRIDGE_AND_EXCHANGE;
                sectionTitle = "Bridge & Exchange"
                break;
            case "on-off ramps":
                testableApps = ON_OFFRAMP;
                sectionTitle = "On/Offramp"
                break;
            case "web3 games":
                testableApps = PLAY_WEB3_GAMES;
                sectionTitle = "Play Web3 Games"
                break;
            default:
                throw new Error("Invalid value for 'apps' check the test step");
        }
        this.isVisible(SECTION_TITLES)
        this.containsText(SECTION_TITLES,sectionTitle)

        testableApps?.forEach(app => {
            let appSection = `[data-cy="${app.name}-section"] `
            this.isVisible(appSection)
            this.hasText(appSection + APP_NAMES, app.name)
            this.hasText(appSection + APP_DESCRIPTIONS, app.description)
            this.hasAttributeWithValue(appSection, "href", app.href)
            // @ts-ignore
            if (app.comingSoon) {
                this.isVisible(appSection + COMMING_SOON_CHIPS)
                this.hasText(appSection + COMMING_SOON_CHIPS, "Coming Soon")
            }
            app.chains.forEach(chain => {
                this.isVisible(`${appSection}[data-cy=${chain}-icon]`)
            })
        })
    }

    static validateAddAnAppButton() {
        this.isVisible(ADD_AN_APP_BUTTON)
        this.hasAttributeWithValue(ADD_AN_APP_BUTTON, "href", ADD_APP_LINK)
    }
}