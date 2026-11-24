import { describe, expect, it } from "vitest";
import {
  concatHex,
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  toHex,
  type Address,
  type Hex,
} from "viem";
import {
  generateSafeMessageHash,
  generateSafeMessageMessage,
  generateSafeMessageTypedData,
  isSafeVersionGte,
  isValidSafeMessageHash,
} from "./safeMessageHash";

/**
 * `SAFE_MSG_TYPEHASH` as declared in Safe's `CompatibilityFallbackHandler.sol`. Hardcoding the
 * deployed constant is the point: it anchors these tests to the contract that will actually
 * validate the signature, not to our own code.
 */
const SAFE_MSG_TYPEHASH =
  "0x60b3cbf8b4a223d68d641b3b6ddf9a298e7f33710cf3d3a9d1146b5a6150fbca";

const SAFE_ADDRESS = "0x1234567890AbcdEF1234567890aBcdef12345678" as Address;

/**
 * An independent derivation of the Safe message hash, built from the EIP-712 primitives the
 * Safe contracts use rather than from `hashTypedData`. If this and the implementation agree,
 * the implementation is producing what the contract will verify — which a test written with
 * `hashTypedData` on both sides could never establish.
 */
function deriveSafeMessageHashByHand(
  safeAddress: Address,
  chainId: number | undefined,
  innerHash: Hex
): Hex {
  const domainSeparator =
    chainId === undefined
      ? keccak256(
          encodeAbiParameters(parseAbiParameters("bytes32, address"), [
            keccak256(toHex("EIP712Domain(address verifyingContract)")),
            safeAddress,
          ])
        )
      : keccak256(
          encodeAbiParameters(parseAbiParameters("bytes32, uint256, address"), [
            keccak256(
              toHex("EIP712Domain(uint256 chainId,address verifyingContract)")
            ),
            BigInt(chainId),
            safeAddress,
          ])
        );

  const structHash = keccak256(
    encodeAbiParameters(parseAbiParameters("bytes32, bytes32"), [
      SAFE_MSG_TYPEHASH,
      // `bytes` members are hashed before encoding, per EIP-712.
      keccak256(innerHash),
    ])
  );

  return keccak256(concatHex(["0x1901", domainSeparator, structHash]));
}

describe("SAFE_MSG_TYPEHASH", () => {
  it("is keccak256 of the SafeMessage type string", () => {
    expect(keccak256(toHex("SafeMessage(bytes message)"))).toBe(
      SAFE_MSG_TYPEHASH
    );
  });
});

describe("isSafeVersionGte", () => {
  it("accepts build metadata, which real L2 Safes carry", () => {
    expect(isSafeVersionGte("1.3.0+L2", "1.3.0")).toBe(true);
    expect(isSafeVersionGte("1.4.1+L2", "1.3.0")).toBe(true);
  });

  it("compares numerically, not lexically", () => {
    // The case a string compare gets wrong: "1.10.0" < "1.9.0" as text.
    expect(isSafeVersionGte("1.10.0", "1.9.0")).toBe(true);
    expect(isSafeVersionGte("1.9.0", "1.10.0")).toBe(false);
  });

  it("places pre-1.3.0 Safes below the threshold", () => {
    expect(isSafeVersionGte("1.1.1", "1.3.0")).toBe(false);
    expect(isSafeVersionGte("1.2.0", "1.3.0")).toBe(false);
    expect(isSafeVersionGte("1.3.0", "1.3.0")).toBe(true);
  });

  it("sorts a prerelease below its release", () => {
    expect(isSafeVersionGte("1.3.0-rc.1", "1.3.0")).toBe(false);
    expect(isSafeVersionGte("1.4.0-rc.1", "1.3.0")).toBe(true);
  });

  it("fails closed on an unparseable version", () => {
    expect(isSafeVersionGte("not-a-version", "1.3.0")).toBe(false);
    expect(isSafeVersionGte("", "1.3.0")).toBe(false);
  });
});

describe("generateSafeMessageTypedData", () => {
  const message = "hello";

  it("omits chainId from the domain below 1.3.0", () => {
    const typedData = generateSafeMessageTypedData(
      { address: SAFE_ADDRESS, chainId: 1, version: "1.1.1" },
      message
    );
    expect(typedData.domain).toEqual({ verifyingContract: SAFE_ADDRESS });
  });

  it("includes chainId from 1.3.0 on", () => {
    const typedData = generateSafeMessageTypedData(
      { address: SAFE_ADDRESS, chainId: 100, version: "1.3.0+L2" },
      message
    );
    expect(typedData.domain).toEqual({
      chainId: 100,
      verifyingContract: SAFE_ADDRESS,
    });
  });

  it("throws on a null version rather than guessing a domain", () => {
    expect(() =>
      generateSafeMessageTypedData(
        { address: SAFE_ADDRESS, chainId: 1, version: null },
        message
      )
    ).toThrow(/version/i);
  });
});

describe("generateSafeMessageHash", () => {
  const typedMessage = {
    domain: { name: "ClearMacro", version: "1", chainId: 1 },
    types: {
      Action: [
        { name: "description", type: "string" },
        { name: "amount", type: "uint256" },
      ],
    },
    primaryType: "Action",
    message: { description: "Transfer", amount: 1000n },
  };

  it("matches a hand-built EIP-712 hash for a >= 1.3.0 Safe", () => {
    const safe = {
      address: SAFE_ADDRESS,
      chainId: 137,
      version: "1.4.1" as const,
    };
    expect(generateSafeMessageHash(safe, typedMessage)).toBe(
      deriveSafeMessageHashByHand(
        SAFE_ADDRESS,
        137,
        generateSafeMessageMessage(typedMessage)
      )
    );
  });

  it("matches a hand-built EIP-712 hash for a < 1.3.0 Safe (no chainId in the domain)", () => {
    const safe = {
      address: SAFE_ADDRESS,
      chainId: 137,
      version: "1.1.1" as const,
    };
    expect(generateSafeMessageHash(safe, typedMessage)).toBe(
      deriveSafeMessageHashByHand(
        SAFE_ADDRESS,
        undefined,
        generateSafeMessageMessage(typedMessage)
      )
    );
  });

  it("gives a < 1.3.0 Safe a different hash from a >= 1.3.0 Safe", () => {
    const base = { address: SAFE_ADDRESS, chainId: 137 };
    expect(generateSafeMessageHash({ ...base, version: "1.1.1" }, typedMessage)).not.toBe(
      generateSafeMessageHash({ ...base, version: "1.3.0" }, typedMessage)
    );
  });

  it("binds the chain, so the same message on two chains hashes differently", () => {
    const base = { address: SAFE_ADDRESS, version: "1.4.1" };
    expect(generateSafeMessageHash({ ...base, chainId: 1 }, typedMessage)).not.toBe(
      generateSafeMessageHash({ ...base, chainId: 137 }, typedMessage)
    );
  });

  it("derives the primary type when the payload omits it", () => {
    const { primaryType: _omitted, ...withoutPrimaryType } = typedMessage;
    expect(generateSafeMessageMessage(withoutPrimaryType)).toBe(
      generateSafeMessageMessage(typedMessage)
    );
  });

  it("produces a 32-byte hex hash", () => {
    const hash = generateSafeMessageHash(
      { address: SAFE_ADDRESS, chainId: 1, version: "1.4.1" },
      typedMessage
    );
    expect(isValidSafeMessageHash(hash)).toBe(true);
  });
});

describe("isValidSafeMessageHash", () => {
  it("rejects anything that is not 32 bytes of hex", () => {
    expect(isValidSafeMessageHash("0x")).toBe(false);
    expect(isValidSafeMessageHash("0x1234")).toBe(false);
    expect(isValidSafeMessageHash("nope")).toBe(false);
    expect(isValidSafeMessageHash(`0x${"a".repeat(66)}`)).toBe(false);
    expect(isValidSafeMessageHash(`0x${"a".repeat(64)}`)).toBe(true);
  });
});
