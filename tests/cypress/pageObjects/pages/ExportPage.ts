import {BasePage, UnitOfTime} from "../BasePage";

const ADDRESS_BUTTONS = "[data-cy=address-button]"
const ADDRESS_INPUT = "[data-cy=address-dialog-input]"
const SEARCH_ENTRIES = "[data-cy=search-entry]"
const REMOVE_ADDRESS_BUTTON = "[data-cy=remove-address-btn]"
const SELECTED_ADDRESSES = "[data-cy=list-selected-address]"
const OK_BUTTON = "[data-cy=ok-button]"
const SEARCH_ADDRESSES = "[data-cy=list-search-address]"
const DATE_RANGES = "[data-cy=date-ranges] input"
const PRICE_GRANULARITY = "[data-cy=price-granularity]"
const ACCOUNTING_PERIOD = "[data-cy=accounting-period]"
const CURRENCY_BUTTON = "[data-cy=currency-button]"
const EXPORT_PREVIEW = "[data-cy=export-preview-button]"
const COLUMN_HEADERS = ".MuiDataGrid-columnHeaderTitleContainer"
const HEADER_TRIPLE_DOTS = "[data-testid=TripleDotsVerticalIcon]"
const FILTER_OPTIONS = "[role=tooltip] li"
const COLUMN_CHECKBOXES = ".MuiDataGrid-panelWrapper input.PrivateSwitchBase-input"
const DATE_PICKER_YEAR_BUTTONS = ".PrivatePickersYear-yearButton"
const DATE_PICKER_MONTH_BUTTONS = ".PrivatePickersMonth-root"
const DATE_PICKER_ICONS = "[data-testid=CalendarIcon]"
const EXPORT_CSV ="[data-cy=export-csv-button]"
const AMOUNT_CELLS = ".MuiDataGrid-cell[data-field=amount]"
const COUNTERPARTY_CELLS = ".MuiDataGrid-cell[data-field=counterparty]"
const DATE_CELLS = ".MuiDataGrid-cell[data-field=date]"
const FILTER_SELECT_FIELDS = ".MuiFormControl-root .MuiInputBase-root select"
const FILTER_INPUT_FIELDS = ".MuiFormControl-root .MuiInputBase-root input"

const EXPORTING_ENDPOINT = "https://accounting.superfluid.dev/v1/stream-periods**"
const TESTING_ACCOUNT1 = "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40"
const TESTING_ACCOUNT2 = "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"

const GranularityWordMap: Record<string, UnitOfTime> = {
    "Hourly": UnitOfTime.Hour,
    "Daily": UnitOfTime.Day,
    "Weekly": UnitOfTime.Week,
    "Monthly": UnitOfTime.Month,
    "Yearly": UnitOfTime.Year,
};

const ApiWordMap: Record<string, string> = {
    "Hourly": "hour",
    "Daily": "day",
    "Weekly": "week",
    "Monthly": "month",
    "Yearly": "year",
};

const allColumns = ["date", "startDate", "amount", "counterparty", "counterpartyAddress", "tokenSymbol", "network", "transaction", "sender", "receiver", "transactionHash", "tokenAddress", "tokenName"]

export class ExportPage extends BasePage {

    static searchForAccount(address: string) {
        this.clickFirstVisible(ADDRESS_BUTTONS)
        this.type(ADDRESS_INPUT, address)
    }

    static selectAddressFromSearchResults(address: string) {
        cy.get(SEARCH_ENTRIES).contains(address).click()
    }

    static validateSelectedAddress(address: string) {
        cy.get(SELECTED_ADDRESSES).contains(address).should("be.visible")
        cy.get(SEARCH_ENTRIES).contains(address).should("be.visible")
    }

    static removeLastSelectedAddressFromSearchList() {
        this.clickFirstVisible(SELECTED_ADDRESSES)
    }

    static validateNoOkPageAndNoEntriesHighlighted() {
        this.doesNotExist(OK_BUTTON)
        this.doesNotExist(SELECTED_ADDRESSES)
    }

    static validateSelectedAddressAmount(amount: string) {
        let expectedText = amount === "0" ? "Select address(es)" : `${amount} address(es) selected`
        cy.get(ADDRESS_BUTTONS).first().should("have.text", expectedText)
    }

    static validatePreviewButtonIsEnabled() {
        this.isNotDisabled(EXPORT_PREVIEW)
    }

    static removeAddressFromTheSelectedAddressList() {
        this.click(REMOVE_ADDRESS_BUTTON)
    }

    static changePriceGranularityTo(period: string) {
        this.click(PRICE_GRANULARITY)
        this.click(`[data-value=${GranularityWordMap[period]}]`)
    }

    static changeAccountingPeriodTo(period: string) {
        this.click(ACCOUNTING_PERIOD)
        this.click(`[data-value=${GranularityWordMap[period]}]`)
    }

    static validateAPIResultsFor(period: string) {
        cy.intercept("GET", EXPORTING_ENDPOINT, (req) => {
            req.query.start = "1672524000"
            req.query.end = "1675202399"
            expect(req.query.priceGranularity).to.eq(ApiWordMap[period].toString())
            expect(req.query.virtualization).to.eq(ApiWordMap[period].toString())
            req.continue((res) => {

            })
        }).as("exportRequest")

        this.clickExportPreview()
        cy.wait("@exportRequest").then(req => {
            cy.fixture("exportData.json").then(data => {
                expect(JSON.parse(req.response?.body)).to.deep.eq(data[period])
            })
        })
        this.isVisible(AMOUNT_CELLS)
    }

    static clickExportPreview() {
        this.click(EXPORT_PREVIEW)
    }

    static validateCorrectlyExportedData(type: string) {
        switch (type) {
            case "multiple accounts":
                cy.intercept("GET", EXPORTING_ENDPOINT, (req) => {
                    expect(req.query.addresses).to.eq(`${TESTING_ACCOUNT1},${TESTING_ACCOUNT2}`)
                }).as("exportRequest")
                this.clickExportPreview()
                cy.wait("@exportRequest").then(req => {
                    cy.fixture("exportData.json").then(data => {
                        expect(JSON.parse(req.response?.body)).to.deep.eq(data[type])
                    })
                })
                this.isVisible(AMOUNT_CELLS)
                break;
            case "counterparty":
                cy.intercept("GET", EXPORTING_ENDPOINT, (req) => {
                    expect(req.query.counterparties).to.eq(TESTING_ACCOUNT1)
                }).as("exportRequest")
                this.clickExportPreview()
                cy.wait("@exportRequest").then(req => {
                    cy.fixture("exportData.json").then(data => {
                        expect(JSON.parse(req.response?.body)).to.deep.eq(data[type])
                    })
                })
                cy.get(COUNTERPARTY_CELLS).each(row => {
                    expect(row).to.have.text(TESTING_ACCOUNT1)
                })
                this.isVisible(AMOUNT_CELLS)
                break;
            case "custom dates":
                cy.intercept("GET", EXPORTING_ENDPOINT, (req) => {
                     expect(req.query.start).to.eq("1640995200")
                     expect(req.query.end).to.eq("1646092799")
                }).as("exportRequest")
                this.click(EXPORT_PREVIEW)
                cy.wait("@exportRequest").then(req => {
                    cy.fixture("exportData.json").then(data => {
                        expect(JSON.parse(req.response?.body)).to.deep.eq(data[type])
                    })
                })
                cy.get(DATE_CELLS).each(row => {
                    expect(row).to.contain.text("2022/01/")
                })
                break;
            case "all columns":
                //Reversing because the first columns aren't rendered when looking from the last
                allColumns.reverse().forEach((column) => {
                    cy.get(`.MuiDataGrid-cell[data-field=${column}]`).first().scrollIntoView()
                    cy.get(`.MuiDataGrid-cell[data-field=${column}]`).each((row, i) => {
                        cy.fixture("exportData.json").then(data => {
                            expect(row).to.have.text(data[type][column][i])
                        })
                    })
                })
                break;

            default:
                throw new Error(`${type} export data to validate is not defined`)
        }
    }

    static changeExportStartDate(date: string) {
        cy.get(DATE_RANGES).first().clear()
        cy.get(DATE_RANGES).first().type(date)
    }

    static changeExportEndDate(date: string) {
        //When typing the end date messes up cypress because it autofills 0s for years
        cy.get(DATE_RANGES).last().click()
    }

    static enableAllPreviewColumns() {
        this.isVisible(AMOUNT_CELLS)
        //Cypress too fast ,waiting for request or data to show up doesn't help,
        //Checkboxes get magically disabled without waiting,
        //Force clicking because mouse events not triggering the three dots to appear
        cy.wait(2000)
        cy.get(HEADER_TRIPLE_DOTS).first().click({force: true})
        this.clickFirstVisible(HEADER_TRIPLE_DOTS)
        cy.get(FILTER_OPTIONS).contains("Show columns").click()
        cy.get(COLUMN_CHECKBOXES).each(checkbox => {
            if (!checkbox.attr("checked")) {
                cy.wrap(checkbox).click()
            }
            cy.get(`.MuiDataGrid-cell[data-field=${checkbox.attr("name")}]`).first().scrollIntoView()
            cy.get(`.MuiDataGrid-cell[data-field=${checkbox.attr("name")}]`).should("be.visible").and("have.length", 8)
        })
    }

    static disableAllPreviewColumns() {
        cy.get(COLUMN_CHECKBOXES).click({multiple: true})
    }

    static validateNoDataShownInThePreview() {
        allColumns.forEach(column => {
            cy.get(`[data-field=${column}]`).should("not.exist")
        })
    }

    static clickPreviewColumn(column: string) {
        cy.get(`.MuiDataGrid-columnHeader[data-field=${column}]`).click()
    }

    static validateColumnSorting(column: string, ascdesc: string) {
        let actualArray: any[] = []
        cy.get(`.MuiDataGrid-cell[data-field=${column}]`).each(row => {
            actualArray.push(row.text())
        })

        cy.wrap(actualArray).then((array) => {
            let expectedArray = [...array].sort(function (a, b) {
                return ascdesc === "ascending" ? a - b : b - a
            });
            expect(expectedArray).to.deep.eq(array);
        });

    }

    static addCustomFilter(column: string, operator: string, value: string) {
        cy.get(HEADER_TRIPLE_DOTS).first().click({force: true})
        this.clickFirstVisible(HEADER_TRIPLE_DOTS)
        cy.get(FILTER_OPTIONS).contains("Filter").click()
        cy.get(FILTER_SELECT_FIELDS).eq(1).select(column)
        cy.get(FILTER_SELECT_FIELDS).last().select(operator)
        cy.get(FILTER_INPUT_FIELDS).type(value)
    }

    static validateFilteredRows(column: string, value: string) {
        cy.get(`.MuiDataGrid-cell[data-field=${column}]`).should("have.length.below", 8)
        cy.get(`.MuiDataGrid-cell[data-field=${column}]`).each(row => {
            cy.wrap(row).should("contain.text", value)
        })
    }

    static validateDisabledPreviewButton() {
        this.isDisabled(EXPORT_PREVIEW)
    }

    static searchForExtraAccount(address: string) {
        this.clear(ADDRESS_INPUT)
        this.type(ADDRESS_INPUT, address)
    }

    static searchForCounterPartyAddress(address: string) {
        cy.get(ADDRESS_BUTTONS).last().click()
        cy.get(ADDRESS_INPUT).type(address)
    }

    static changeEndDateWithUI(month: string, year: string) {
        cy.get(DATE_PICKER_ICONS).last().click()
        cy.get(DATE_PICKER_YEAR_BUTTONS).contains(year).click()
        cy.get(DATE_PICKER_MONTH_BUTTONS).contains(month).click()
    }

    static clickExportCSVButton() {
        this.isVisible(AMOUNT_CELLS)
        this.click(EXPORT_CSV)
    }

    static validateDownloadedCSV() {
        cy.fixture("streamPeriodExportExample.csv").then(csv => {
            cy.readFile("cypress/downloads/Stream periods export.csv").then(downloadedCSV => {
                expect(csv).to.eq(downloadedCSV)
            })
        })
    }
}