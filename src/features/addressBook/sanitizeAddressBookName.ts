const FORBIDDEN_NAME_CHARS_REGEX = new RegExp(`[^\\w\\s]`, "gm");
const FORBIDDEN_0x_BEGINNING = /^0x/;

const sanitizeAddressBookName = (name: string): string => {
  return name
    .trim()
    .replace(FORBIDDEN_NAME_CHARS_REGEX, "")
    .replace(FORBIDDEN_0x_BEGINNING, "")
    .substring(0, 24);
};

export default sanitizeAddressBookName;
