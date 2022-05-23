import {BasePage} from "../BasePage";

const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]"
const DASHBOARD_CONNECT_PLACEHOLDER = "[data-cy=dashboard-placeholder-connect]"

export class DashboardPage extends BasePage {

    static checkIfDashboardConnectIsVisible() {
        this.isVisible(DASHBOARD_CONNECT_PLACEHOLDER)
        this.isVisible(CONNECT_WALLET_BUTTON)
        //2 buttons should be visible, one in the nav drawer, one in the dashboard page
        this.hasLength(CONNECT_WALLET_BUTTON,2)
    }
}