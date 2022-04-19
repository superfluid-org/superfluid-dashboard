export default function shortenAddress(address: string, length = 4) {
    return `${address.substring(0, 2 + length)}...${address.substring(
      address.length - length,
      address.length
    )}`;
  }