import {BasePage} from "../BasePage";
import {DashboardPage} from "./DashboardPage";

const NAVIGATION_BUTTON_PREFIX = "[data-cy=nav-";

export class Common extends BasePage {
    static clickNavBarButton(button: string) {
        this.click(NAVIGATION_BUTTON_PREFIX + button + "]")
    }

    static openPage(page: string) {
        switch(page.toLowerCase()) {
            case "dashboard page":
                cy.visit("/")
                break;
            case "wrap page":
                cy.visit("/wrap?upgrade")
                break;
            case "send page":
                cy.visit("/send")
                break;
        }
    }

    static openPageWithMockedProvider() {
        cy.openSuperfluidMockedWeb3()
        cy.visit("/")
    }

    static clickConnectWallet() {
        this.clickFirstVisible("[data-cy=connect-wallet-button]")
    }

}