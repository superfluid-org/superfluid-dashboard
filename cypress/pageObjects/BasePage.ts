export enum UnitOfTime {
    Second = 1,
    Minute = 60,
    Hour = 3600,
    Day = 86400,
    Week = 604800,
    Month = 2592000,
    Year = 31536000
}

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

    static type(selector: string, text: string) {
        cy.get(selector).filter(":visible").type(text);
    }

    static hasText(
        selector: string,
        text?: JQuery<HTMLElement> | string | string[]
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

    static hasValue(selector: string, value: string) {
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

}
