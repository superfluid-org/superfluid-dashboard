import {BasePage} from "../BasePage";
import {BUILT_ON_SUPERFLUID} from "../../../src/pages/ecosystem";
import {SUPERFLUID_INTEGRATIONS} from "../../../src/pages/ecosystem";
import {SUPPORTS_SUPER_TOKENS} from "../../../src/pages/ecosystem";

const APP_NAMES = "[data-cy=app-name]"
const APP_DESCRIPTIONS = "[data-cy=app-description]"
const APP_LINKS = "[data-cy=app-link-button]"
const COMMING_SOON_CHIPS = "[data-cy=app-comming-soon]"
const ADD_AN_APP_BUTTON = "[data-cy=add-new-app-button]"
const ADD_APP_LINK = "https://github.com/superfluid-finance/ecosystem/"

export class EcosystemPage extends BasePage {

    static validateProjectsBuiltOnSuperfluid(apps:string){
        let testableApps;
        if(apps === "built on superfluid") {
            testableApps = BUILT_ON_SUPERFLUID
        }
        if(apps === "have integrated superfluid") {
            testableApps = SUPERFLUID_INTEGRATIONS
        }
        if(apps === "supporting super tokens"){
            testableApps = SUPPORTS_SUPER_TOKENS
        }
        testableApps?.forEach(app => {
            let appSection = `[data-cy="${app.name}-section"] `
            this.isVisible(appSection)
            this.hasText(appSection + APP_NAMES,app.name)
            this.hasText(appSection + APP_DESCRIPTIONS , app.description)
            this.hasAttributeWithValue(appSection,"href",app.href)
            if(app.comingSoon) {
                this.isVisible(appSection + COMMING_SOON_CHIPS)
                this.hasText(appSection + COMMING_SOON_CHIPS,"Coming Soon")
            }
            app.chains.forEach(chain => {
                this.isVisible(`${appSection}[data-cy=${chain}-icon]`)
            })
        })
    }

    static validateAddAnAppButton() {
        this.isVisible(ADD_AN_APP_BUTTON)
        this.hasAttributeWithValue(ADD_AN_APP_BUTTON,"href", ADD_APP_LINK)
    }
}