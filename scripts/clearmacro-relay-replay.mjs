/**
 * Replays a Clear Macro relay execution request on-chain to diagnose relay rejections —
 * most importantly 422 PREFLIGHT_REVERTED, whose `details` the provider currently leaves
 * empty. See "Incident retrospective" in docs/plans/clear-macro-relay-integration.md.
 *
 * Usage:
 *   node scripts/clearmacro-relay-replay.mjs <request-body.json> [executorAddress...]
 *
 * <request-body.json> is the verbatim body of the failing
 * `POST /clearmacro-provider/v1/relay-executions` (copy from the browser's network tab;
 * pass `-` to read it from stdin). Optional executor addresses are simulated as
 * `runMacro` callers; by default the script uses the known relay signer plus a control
 * address that must fail with ProviderNotAuthorized.
 *
 * Interpretation: if the simulation succeeds from every role-granted executor, the signed
 * payload is valid and executable — the relay's rejection is on its side (typically its
 * OZ-Relayer signer missing the provider ACL role). If it reverts, the decoded error is
 * the actual on-chain failure of the action.
 */
import { readFileSync } from "node:fs";
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  decodeAbiParameters,
  http,
  keccak256,
  recoverAddress,
  stringToBytes,
} from "viem";
import * as chains from "viem/chains";
import { clearMacroForwarderAbi, clearMacroForwarderAddress } from "@sfpro/sdk/abi";
import sfMeta from "@superfluid-finance/metadata";
import { dashboardClearMacroAbi } from "../src/features/clearMacro/dashboardClearMacro.ts";

/** Relay signers known to be in use (from observed relayed transactions). */
const KNOWN_RELAY_SIGNERS = {
  // macros.superfluid.eth on OP Sepolia, first seen 2026-06-12
  11155420: ["0x29e21461982d900ca7cd211f1e740f7221754f4f"],
};
const CONTROL_EXECUTOR = "0x1111111111111111111111111111111111111111";

const SIMPLE_ACL_ABI = [
  {
    type: "function",
    name: "hasRole",
    stateMutability: "view",
    inputs: [{ type: "bytes32" }, { type: "address" }],
    outputs: [{ type: "bool" }],
  },
];
const HOST_ABI = [
  {
    type: "function",
    name: "getSimpleACL",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
];
const PAYLOAD_ABI_PARAMETERS = [
  {
    name: "Payload",
    type: "tuple",
    components: [
      { name: "action", type: "tuple", components: [{ name: "params", type: "bytes" }] },
      {
        name: "security",
        type: "tuple",
        components: [
          { name: "domain", type: "string" },
          { name: "macroContract", type: "address" },
          { name: "provider", type: "string" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      },
    ],
  },
];

const [bodyArg, ...executorArgs] = process.argv.slice(2);
if (!bodyArg) {
  console.error("Usage: node scripts/clearmacro-relay-replay.mjs <request-body.json|-> [executorAddress...]");
  process.exit(1);
}
const body = JSON.parse(bodyArg === "-" ? readFileSync(0, "utf8") : readFileSync(bodyArg, "utf8"));
const { chainId, macroAddress, signerAddress, payload, signature } = body;

const chain = Object.values(chains).find((c) => c?.id === chainId);
if (!chain) throw new Error(`No viem chain definition for chainId ${chainId}.`);
const forwarderAddress = clearMacroForwarderAddress[chainId];
if (!forwarderAddress) throw new Error(`No ClearMacroForwarder deployment for chainId ${chainId}.`);
const client = createPublicClient({ chain, transport: http(process.env.RPC_URL) });

const [decoded] = decodeAbiParameters(PAYLOAD_ABI_PARAMETERS, payload);
const { security } = decoded;
const now = BigInt(Math.floor(Date.now() / 1000));
console.log(`chain ${chainId} (${chain.name}), forwarder ${forwarderAddress}, macro ${macroAddress}`);
console.log(`security: domain="${security.domain}" provider="${security.provider}" nonce=${security.nonce}`);
console.log(
  `validity: validAfter=${security.validAfter} validBefore=${security.validBefore}` +
    ` (now=${now}${security.validBefore !== 0n && now > security.validBefore ? " — EXPIRED: expect OutsideValidityWindow below" : ""})`
);

const digest = await client.readContract({
  address: forwarderAddress,
  abi: clearMacroForwarderAbi,
  functionName: "getDigest",
  args: [macroAddress, payload],
});
const recovered = await recoverAddress({ hash: digest, signature });
console.log(
  `digest ${digest} recovers to ${recovered} — ${
    recovered.toLowerCase() === signerAddress.toLowerCase() ? "matches signerAddress" : `MISMATCH (expected ${signerAddress})`
  }`
);

const onChainNonce = await client.readContract({
  address: forwarderAddress,
  abi: clearMacroForwarderAbi,
  functionName: "getNonce",
  args: [signerAddress, 0n],
});
console.log(
  `on-chain nonce (key 0): ${onChainNonce}, payload nonce: ${security.nonce}` +
    (onChainNonce !== security.nonce ? " — MISMATCH: expect InvalidNonce below" : "")
);

const hostAddress = sfMeta.getNetworkByChainId(chainId)?.contractsV1?.host;
const aclAddress = hostAddress
  ? await client.readContract({ address: hostAddress, abi: HOST_ABI, functionName: "getSimpleACL" }).catch(() => undefined)
  : undefined;
const providerRole = keccak256(stringToBytes(security.provider));

const executors = [
  ...(executorArgs.length > 0 ? executorArgs : KNOWN_RELAY_SIGNERS[chainId] ?? []),
  CONTROL_EXECUTOR,
];
if (executors.length === 1) {
  console.warn("No known relay signer for this chain — pass executor addresses as arguments.");
}

for (const executor of executors) {
  const label = executor === CONTROL_EXECUTOR ? "control (must fail ProviderNotAuthorized)" : "executor";
  const hasRole = aclAddress
    ? await client
        .readContract({ address: aclAddress, abi: SIMPLE_ACL_ABI, functionName: "hasRole", args: [providerRole, executor] })
        .catch(() => undefined)
    : undefined;
  const roleNote = hasRole === undefined ? "" : ` (provider role: ${hasRole ? "granted" : "NOT granted"})`;
  try {
    await client.simulateContract({
      address: forwarderAddress,
      abi: [...clearMacroForwarderAbi, ...dashboardClearMacroAbi],
      functionName: "runMacro",
      args: [macroAddress, payload, signerAddress, signature],
      account: executor,
    });
    console.log(`${label} ${executor}${roleNote} → OK (runMacro would succeed)`);
  } catch (error) {
    let detail = error instanceof Error ? (error.shortMessage ?? error.message) : String(error);
    if (error instanceof BaseError) {
      const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
      if (revert?.data) detail = `${revert.data.errorName}(${(revert.data.args ?? []).join(", ")})`;
      else if (revert?.signature) detail = `unrecognized error selector ${revert.signature} (raw: ${revert.raw})`;
    }
    console.log(`${label} ${executor}${roleNote} → REVERT: ${String(detail).split("\n")[0]}`);
  }
}
