const FORBIDDEN_NAME_CHARS_REGEX = new RegExp(`[^\\w\\s]`, "gm");

const sanitizeAddressBookName = (name: string): string => {
  return name.replace(FORBIDDEN_NAME_CHARS_REGEX, "");
};

export default sanitizeAddressBookName;
