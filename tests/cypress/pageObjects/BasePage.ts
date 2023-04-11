import {default as Wallet} from "ethereumjs-wallet";
import format from "date-fns/format";


export enum UnitOfTime {
    Second = 1,
    Minute = 60,
    Hour = 3600,
    Day = 86400,
    Week = 604800,
    Month = 2628000,
    Year = 31536000
}

export const wordTimeUnitMap: Record<string, UnitOfTime> = {
    "second": UnitOfTime.Second,
    "minute": UnitOfTime.Minute,
    "hour": UnitOfTime.Hour,
    "day": UnitOfTime.Day,
    "week": UnitOfTime.Week,
    "month": UnitOfTime.Month,
    "year": UnitOfTime.Year,
};

export class BasePage {

    static ensureDefined<T>(value: T | undefined | null): T {
        if (!value) throw Error('Value has to be defined.');
        return value;
    }

    static shortenHex(address: string, length = 4) {
        return `${address.substring(0, 2 + length)}...${address.substring(
            address.length - length,
            address.length
        )}`;
    }

    static click(selector: string, index: number = 0) {
        if(index){
            cy.get(selector).eq(index).click();
        }
        cy.get(selector).click()
    }

    static clickVisible(selector: string) {
        cy.get(selector).filter(":visible").click();
    }

    static clickFirstVisible(selector: string) {
        cy.get(selector).filter(":visible").first().click();
    }

    static scrollToAndClick(selector: string) {
        cy.get(selector).scrollIntoView().click();
    }

    static type(selector: string, text: string | number) {
        cy.get(selector).filter(":visible").type(text.toString());
    }

    static hasText(
        selector: string,
        text?: JQuery<HTMLElement> | string | string[] | number
    ) {
        cy.get(selector).filter(":visible").should("have.text", text);
    }

    static check(selector: string) {
        cy.get(selector).check();
    }

    static scrollToAndhasText(selector: string, text: string) {
        cy.get(selector).scrollIntoView().should("have.text", text);
    }

    static doesNotExist(selector: string) {
        cy.get(selector).should("not.exist");
    }

    static exists(selector: string) {
        cy.get(selector).should("exist");
    }

    static isVisible(selector: string) {
        cy.get(selector).should("be.visible");
    }

    static isNotVisible(selector: string) {
        cy.get(selector).should("not.be.visible");
    }

    static isFocused(selector: string) {
        cy.get(selector).should("have.focus");
    }

    static isNotDisabled(selector: string) {
        cy.get(selector).should("not.have.attr", "disabled");
    }

    static isDisabled(selector: string) {
        cy.get(selector).should("have.attr", "disabled");
    }

    static selectOption(selector: string, option: string) {
        cy.get(selector).filter(":visible").select(option);
    }

    static validatePageUrl(appendix: string) {
        cy.url().should("eq", Cypress.config().baseUrl + appendix);
    }

    static containsValue(selector: string, value: string) {
        cy.get(selector).should("contain.value", value);
    }

    static containsText(selector: string, text: string) {
        cy.get(selector).should("contain.text", text);
    }

    static contains(selector: string, number: string) {
        cy.get(selector).should("contain", number);
    }

    static clear(selector: string) {
        cy.get(selector).filter(":visible").clear();
    }

    static hasLength(selector: string, length: number) {
        cy.get(selector).should("have.length", length);
    }

    static hasValue(selector: string, value: JQuery<HTMLElement> | string ) {
        cy.get(selector).should("have.value", value);
    }

    static hasAttributeWithValue(
        selector: string,
        attribute: string,
        value: string
    ) {
        cy.get(selector).should("have.attr", attribute, value);
    }

    static getShortenedAddress(address: JQuery<HTMLElement> | string, chars = 4) {
        return (
            `${address.slice(0, chars + 2)}...${address.slice(address.length - chars, address.length)}`
        );
    }

    static getShortenedHashAddress(hash: string, chars = 6) {
        return `${hash.slice(0, chars)}...`;
    }

    static getDayTimestamp(days:number) {
        let today = new Date()
        let timestamp = today.setDate(today.getDate() + days)
        return Number((timestamp.valueOf() / 1000).toFixed())
    }

    static getNotificationDateString(date: Date) {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'
        })
    }

    static generateNewWallet() {
        const { default: Wallet } = require('ethereumjs-wallet');
        const wallet = Wallet.generate();
        const privateKey = wallet.getPrivateKeyString();
        const publicKey = wallet.getChecksumAddressString()
        cy.wrap(privateKey).as("newWalletPrivateKey")
        cy.wrap(publicKey).as("newWalletPublicKey")
        cy.log(`Public key:${publicKey}`)
        cy.log(`Private key:${privateKey}`)
        return privateKey
    }

    static getNotifDateAssertStringFromDate(date:Date) {
        return format(Number((date.getTime() / 1000).toFixed(0)) * 1000, "yyyy/MM/dd HH:mm")
    }
}
