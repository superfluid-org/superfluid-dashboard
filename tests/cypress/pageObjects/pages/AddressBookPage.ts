import { BasePage } from '../BasePage';
import {
  findNetworkByChainId,
  networksByChainId,
  networksBySlug,
} from '../../superData/networks';
import {
  CONNECTED_WALLET,
  DROPDOWN_BACKDROP,
  LIQUIDATED_OR_CANCEL_ICON,
} from './Common';
import { Common } from './Common';

const NO_ADDRESSES_TITLE = '[data-cy=no-address-title]';
const NO_ADDRESSES_MESSAGE = '[data-cy=no-address-message]';
const ADD_ADDRESS_BUTTON = '[data-cy=add-address-btn]';
const REMOVE_ADDRESS_BUTTON = '[data-cy=remove-button]';
const ADDRESS_DIALOG_INPUT = '[data-cy=address-dialog-input] input';
const NAME_DIALOG_INPUT = '[data-cy=name-dialog-input] input';
const NETWORK_SELECTION = '#network-select';
const ADDRESS_NAMES = '[data-cy=address-name]';
const ENS_NAMES = '[data-cy=actual-address] [data-cy=ens-name]';
const ACTUAL_ADDRESSES = '[data-cy=actual-address] p';
const REMOVE_CHECKBOX = '[data-cy=delete-name-checkbox]';
const CANCEL_BUTTON = '[data-cy=cancel-button]';
const EDIT_BUTTON = '[data-cy=edit-button]';
const EDIT_INPUT = '[data-cy=edit-input] input';
const SAVE_BUTTON = '[data-cy=save-button]';
const NETWORKS_CELLS = '[data-cy=networks]';
const IMPORT_BUTTON = '[data-cy=import-button]';
const IMPORT_INPUT = 'input[type=file]';
const EXPORT_BUTTON = '[data-cy=export-button]';
const CONTRACT_ADDRESSES = '[data-cy=contract-addresses]';
const WALLET_ADDRESSES = '[data-cy=wallet-addresses]';
const NO_ADDRESS_BOOK_RESULTS = '[data-cy=no-address-book-results]';
const ADDRESS_BOOK_ENTRIES = '[data-cy=address-book-entry]';
const ADDRESS_BOOK_ENTRIES_NAME = `${ADDRESS_BOOK_ENTRIES} h6`;
const ADDRESS_BOOK_ENTRIES_ADDRESS = `${ADDRESS_BOOK_ENTRIES} p`;
const ADDRESS_FILTER_SEARCH_FIELD = '[data-cy=address-filter-search-field]';
const ADDRESS_FILTER_BUTTON = '[data-cy=address-filter]';
const ADDRESS_FILTER_NAMES = '[data-cy=address]';
const ADDRESS_FILTER_CLEAR_ALL = '[data-cy=clear-all-chip]';
const ADDRESS_FILTER_NAME_CHIPS = '[data-cy=address-chip]';
const COPY_BUTTONS = '[data-testid=ContentCopyRoundedIcon]';
const COPY_TOOLTIPS = '[role=tooltip] .MuiTooltip-tooltip';

export class AddressBookPage extends BasePage {
  static clickFirstCopyButton() {
    cy.get(COPY_BUTTONS).first().scrollIntoView().click();
  }
  static stopHoveringOnFirstAddress() {
    this.trigger(ACTUAL_ADDRESSES, 'mouseout', 0);
  }
  static validateTooltipText(text: string) {
    this.hasText(COPY_TOOLTIPS, text);
  }
  static hoverOnFirstAddress() {
    this.trigger(ACTUAL_ADDRESSES, 'mouseover', 0);
  }
  static hoverOnFirstAddressCopyButton() {
    this.trigger(COPY_BUTTONS, 'mouseover', 0);
  }
  static searchForAddressBookReceiverAndSelectIt(name: string) {
    Common.searchForReceiver(name);
    this.clickFirstVisible(ADDRESS_BOOK_ENTRIES);
  }

  static validateNoAddressesMessage() {
    this.hasText(NO_ADDRESSES_TITLE, 'No Addresses Available');
    this.hasText(
      NO_ADDRESSES_MESSAGE,
      'Addresses you have transacted with or imported will appear here.'
    );
  }

  static validateAddressBookName(name: string, index = 0) {
    this.hasText(ADDRESS_NAMES, name, index);
  }

  static editLastEntry(name: string) {
    this.trigger(ADDRESS_NAMES, 'mouseover', -1);
    this.click(EDIT_BUTTON);
    this.clear(EDIT_INPUT);
    this.type(EDIT_INPUT, name);
    this.click(EDIT_BUTTON);
  }

  static removeLastEntry() {
    this.click(REMOVE_ADDRESS_BUTTON);
    this.hasText(REMOVE_ADDRESS_BUTTON, 'Confirm removing (0)');
    this.isDisabled(REMOVE_ADDRESS_BUTTON);
    this.click(REMOVE_CHECKBOX, -1);
    this.hasText(REMOVE_ADDRESS_BUTTON, 'Confirm removing (1)');
    this.click(REMOVE_ADDRESS_BUTTON);
  }

  static addNewAddress(address: string, name: string, network: string) {
    this.click(ADD_ADDRESS_BUTTON);
    this.type(ADDRESS_DIALOG_INPUT, address);
    if (name !== '-') {
      this.type(NAME_DIALOG_INPUT, name);
    }
    if (network !== '-') {
      this.click(NETWORK_SELECTION);
      this.scrollTo(`[data-value=${network}]`);
      this.click(`[data-value=${network}]`);
      this.click(DROPDOWN_BACKDROP, -1);
    }
    this.click(SAVE_BUTTON, 0, { timeout: 30000 });
  }

  static validateAddressBookNetwork(networks: string, index = 0) {
    if (networks === '-') {
      this.hasText(NETWORKS_CELLS, networks, index);
    } else {
      let allNetworks = networks.split(' ');
      allNetworks.forEach((network) => {
        this.get(NETWORKS_CELLS, index)
          .find(`[data-cy=${networksBySlug.get(network).id}-icon]`)
          .should('be.visible');
      });
    }
  }

  static validateSavedAddress(address: string, index = 0) {
    this.containsText(ACTUAL_ADDRESSES, this.shortenHex(address, 6), index);
  }

  static validateLastSavedAddressENSName(name: string, index = 0) {
    this.hasText(ENS_NAMES, name, index);
  }

  static exportAddressBook() {
    this.click(EXPORT_BUTTON);
  }

  static importAddressBook() {
    cy.get(IMPORT_INPUT).selectFile('cypress/fixtures/addressBookImport.csv', {
      force: true,
    });
    this.isVisible(ADDRESS_NAMES, undefined, { timeout: 60000 });
  }

  static validateExportedAddressBook() {
    cy.fixture('addressBookImport.csv').then((csv) => {
      cy.task('downloads', 'cypress/downloads/').then((file) => {
        cy.readFile(`cypress/downloads/${file[0]}`).then((downloadedCSV) => {
          expect(csv).to.eq(downloadedCSV.replaceAll('\r', ''));
        });
      });
    });
  }

  static validateAddedContractAddress(
    address: string,
    name: string,
    network: string
  ) {
    this.isVisible(`${CONTRACT_ADDRESSES} ${ADDRESS_NAMES}`);
    this.isVisible(`${CONTRACT_ADDRESSES} ${NETWORKS_CELLS}`);
    this.isVisible(`${CONTRACT_ADDRESSES} ${ACTUAL_ADDRESSES}`);
    this.validateSavedAddress(address);
    this.validateAddressBookName(name);
    this.validateAddressBookNetwork(network);
  }

  static validateNoAddressBookResults() {
    this.isVisible(NO_ADDRESS_BOOK_RESULTS);
    this.hasText(NO_ADDRESS_BOOK_RESULTS, 'No results');
  }

  static validateAddressBookResult(name: string, address: string) {
    this.isVisible(ADDRESS_BOOK_ENTRIES);
    this.hasText(ADDRESS_BOOK_ENTRIES_NAME, name);
    this.hasText(ADDRESS_BOOK_ENTRIES_ADDRESS, address);
  }

  static validateConnectedWalletName(name: string) {
    this.hasText(CONNECTED_WALLET, name);
  }

  static setupAddressBook() {
    cy.log('Setting up address book');
    let addressBookEntries = JSON.stringify({
      ids: '["0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40","0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2","0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9","0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4","0x9B6157d44134b21D934468B8bf709294cB298aa7","0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B","0x8ac9C6D444D12d20BC96786243Abaae8960D27e2","0x1dDc50A8b8ef07c654B4ace65070B0E7acfF622B","0x70fd86d7196813505ca9f9a77ef53Ab06A5ca603","0x9Fa707BCCA8B7163da2A30143b70A9b8BE0d0788","0x0BBE3e9f2FB2813E1418ddAf647d64A70de697d0","0xe7ec208720dbf905b43c312Aa8dD2E0f3C865501","0x36136B6b657D02812E4E8B88d23B552320F84698","0x195Dba965938ED77F8F4D25eEd0eC8a08407dA05","0x982046AeF10d24b938d85BDBBe262B811b0403b7","0x340aeC5e697Ed31D70382D8dF141aAefA6b15E49"]',
      entities:
        '{"0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40":{"name":"","address":"0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40","associatedNetworks":[1,100,137],"isContract":false},"0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2":{"name":"Multiple networks test","address":"0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2","associatedNetworks":[1,100,137,10,42161,43114,56,42220],"isContract":false},"0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9":{"name":"john","address":"0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9","associatedNetworks":[],"isContract":false},"0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4":{"name":"dan","address":"0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4","associatedNetworks":[],"isContract":false},"0x9B6157d44134b21D934468B8bf709294cB298aa7":{"name":"bob","address":"0x9B6157d44134b21D934468B8bf709294cB298aa7","associatedNetworks":[],"isContract":false},"0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B":{"name":"alice","address":"0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B","associatedNetworks":[],"isContract":false},"0x8ac9C6D444D12d20BC96786243Abaae8960D27e2":{"name":"Static Balance Account","address":"0x8ac9C6D444D12d20BC96786243Abaae8960D27e2","associatedNetworks":[],"isContract":false},"0x1dDc50A8b8ef07c654B4ace65070B0E7acfF622B":{"name":"ENS Test","address":"0x1dDc50A8b8ef07c654B4ace65070B0E7acfF622B","associatedNetworks":[],"isContract":false},"0x70fd86d7196813505ca9f9a77ef53Ab06A5ca603":{"name":"Celo","address":"0x70fd86d7196813505ca9f9a77ef53Ab06A5ca603","associatedNetworks":[42220],"isContract":true},"0x9Fa707BCCA8B7163da2A30143b70A9b8BE0d0788":{"name":"Optimism","address":"0x9Fa707BCCA8B7163da2A30143b70A9b8BE0d0788","associatedNetworks":[10],"isContract":true},"0x0BBE3e9f2FB2813E1418ddAf647d64A70de697d0":{"name":"Avalanche","address":"0x0BBE3e9f2FB2813E1418ddAf647d64A70de697d0","associatedNetworks":[43114],"isContract":true},"0xe7ec208720dbf905b43c312Aa8dD2E0f3C865501":{"name":"Arbitrum One","address":"0xe7ec208720dbf905b43c312Aa8dD2E0f3C865501","associatedNetworks":[42161],"isContract":true},"0x36136B6b657D02812E4E8B88d23B552320F84698":{"name":"BSC","address":"0x36136B6b657D02812E4E8B88d23B552320F84698","associatedNetworks":[56],"isContract":true},"0x195Dba965938ED77F8F4D25eEd0eC8a08407dA05":{"name":"Polygon","address":"0x195Dba965938ED77F8F4D25eEd0eC8a08407dA05","associatedNetworks":[137],"isContract":true},"0x982046AeF10d24b938d85BDBBe262B811b0403b7":{"name":"Ethereum","address":"0x982046AeF10d24b938d85BDBBe262B811b0403b7","associatedNetworks":[1],"isContract":true},"0x340aeC5e697Ed31D70382D8dF141aAefA6b15E49":{"name":"Gnosis","address":"0x340aeC5e697Ed31D70382D8dF141aAefA6b15E49","associatedNetworks":[100],"isContract":true}}',
      _persist: '{"version":1,"rehydrated":true}',
    });
    window.localStorage.setItem('persist:addressBook', addressBookEntries);
  }

  static validateImportedAndSetupAddresses() {
    cy.fixture('addressBookImport.csv')
      .then((csv) => csv.split('\n').map((row) => row.trim()))
      .then((rows) => {
        rows.shift();
        rows.forEach((row, index) => {
          let entry = row.split(',');
          let address = entry[0];
          let name = entry[1];
          let chainIds = entry[2].split(' ');
          if (name) {
            this.validateAddressBookName(name, index);
          } else {
            this.validateAddressBookName(this.shortenHex(address), index);
          }
          this.validateSavedAddress(address, index);
          chainIds.forEach((network) => {
            if (network) {
              this.validateAddressBookNetwork(
                findNetworkByChainId(Number(network)).slugName,
                index
              );
            } else {
              this.validateAddressBookNetwork('-', index);
            }
          });
        });
      });
  }

  static openAddressFilter() {
    this.click(ADDRESS_FILTER_BUTTON);
  }

  static typeInAddressFilter(name: string) {
    this.type(ADDRESS_FILTER_SEARCH_FIELD, name);
  }

  static selectNameInAddressFilter(name: string) {
    cy.contains(ADDRESS_FILTER_NAMES, name).click();
  }

  static validateFilteredAddresses(name: string) {
    cy.get(ADDRESS_FILTER_NAMES).each((el) => {
      cy.wrap(el).should('contain.text', name);
    });
  }

  static clickClearAllFilterChip() {
    this.click(ADDRESS_FILTER_CLEAR_ALL);
  }

  static clickSpecificAddressClearChip(name: string) {
    cy.contains(ADDRESS_FILTER_NAME_CHIPS, name)
      .find(LIQUIDATED_OR_CANCEL_ICON)
      .click();
  }

  static clearAddressBookSearchField() {
    this.clear(ADDRESS_FILTER_SEARCH_FIELD);
  }

  static validateNoNamesInAddressFilter() {
    this.doesNotExist(ADDRESS_FILTER_NAMES);
  }
}
