import { type Address, stringToHex } from "viem";

/**
 * DashboardClearMacro ABI, generated from the Foundry project in `contracts/`
 * (regenerate with `pnpm contracts:abi`).
 *
 * Deployed and Etherscan-verified on nine networks, all wired up in networks.ts. That is every
 * deployable network: the macro's constructor takes a FlowScheduler, so the nine are exactly the
 * networks with a non-undefined `flowSchedulerContractAddress`, matching the chain table in
 * contracts/script/DeployDashboardClearMacro.s.sol one-for-one.
 *
 * The first four below were built from master 28aa6ab2, the last five from master 599755ed — two
 * builds, same 19,879-byte executable size. Executable bytecode was confirmed byte-identical
 * across the original four (compare by masking the artifact's `immutableReferences` spans and
 * truncating before the CBOR metadata block, whose offset is
 * `len(code) - 2 - <the big-endian length in the last 2 bytes>` — NOT by the trailing metadata
 * hash, which is not reproducible across CI runs, see
 * docs/plans/clear-macro-multi-network-deploy.md):
 *
 *   optimism-sepolia 0x96ec6a06fb72c8C3e42E9DD3ae3525e7847078c3  fee token fUSDCx 0x131780640EDf9830099AAc2203229073d6D2FE69
 *   base-mainnet     0xC04FE9940e460457B75C3Aa4871bF142E0f49744  fee token USDCx  0xD04383398dD2426297da660F9CCA3d439AF9ce1b
 *   arbitrum-one     0x3BDd82FFbCcB9DBD0c233Ecd950642edbF60D667  fee token USDCx  0xFc55F2854e74b4f42D01a6d3DAAC4c52D9dfdcFf
 *   optimism-mainnet 0x4D11B0b59948d81EEAaF667CCDaA212f824949d4  fee token USDCx  0x35Adeb0638EB192755B6E52544650603Fe65A006
 *   bsc-mainnet      0x53d00397f03147A9bD9c40443A105A82780deAF1  fee token USDCx  0x0419e1fA3671754F77EC7D5416219A5f9A08B530
 *   xdai-mainnet     0x7786Da9DEC051b1CE13AA5d6701f6D2655D01De6  fee token USDCx  0x1234756ccf0660E866305289267211823Ae86eEc
 *   avalanche-c      0x02CF8483b15eb1211235D8bb5041BE5024Ef657F  fee token USDCx  0x288398F314D472B82C44855F3f6fF20b633c2A97
 *   polygon-mainnet  0x478A32945F569FB3c14B72080c9e6f9AcEAAAc7D  fee token USDCx  0x07b24BBD834c1c546EcE89fF95f71D9F13a2eBD1
 *   eth-mainnet      0x1bBc06F00b9F5964eb8F7ED044e15C8dE13368bE  fee token USDCx  0x1BA8603DA702602A8657980e825A6DAa03Dee93a
 *
 * All nine are the five-arg fee-charging macro from
 * contracts/script/DeployDashboardClearMacro.s.sol at base fee 0.1, paying the Superfluid DAO
 * Safe 0xac808840f02c47C05507f48165d2222FF28EF4e1. NOTE: that Safe has no code yet on
 * optimism-mainnet, arbitrum-one, optimism-sepolia, bsc-mainnet, xdai-mainnet, polygon-mainnet
 * and avalanche-c — fees accrue to it there from the moment each address is wired up, and are
 * only retrievable once the Safe is deployed at that address on those chains. Deploying it is an
 * open follow-up. eth-mainnet is the exception: the Safe is live there, so its fees are
 * retrievable immediately.
 *
 * Every action AND the fee reads (`previewRelayFee`/`feeToken`/`baseFee`) are live on-chain. Fees
 * are charged in units of the base fee: 1 per relayed action plus 2 per reserved keeper execution
 * (each scheduled start/stop date), so a new schedule costs 0.3–0.5 while plain actions stay at
 * 0.1, and `previewRelayFee` quotes the exact fee for the encoded action alongside the worst-case
 * max. The build keeps the combined DeleteFlow (also removes the signer's flow schedule row — see
 * docs/plans/clear-macro-combined-delete.md) and ScheduleFlow's immediate-start mode (startDate 0
 * + positive rate = create the flow now, schedule only the stop).
 *
 * Superseded instances, newest first. The first two are a distinct earlier build (19,852 bytes)
 * — same features, but not the code above:
 *   0xEde7e7d71AE56af5CcF8f36952f9bb85FB16fC2d (op-sepolia) paid fees to a fresh empty address,
 *     0x74cD5673dF7efC148067Ecab494A19a46b0a3167, so arriving fees showed as its whole balance;
 *   0x7043E0B26F221470289d771Ef3139460623D073b (base) same build, left unverified and never wired
 *     up — history, not a pending verification task;
 *   0xEeFC8492f24898289E65Ee06dE7B8A19F30832a5 — same features at base fee 0.01 charged flat per
 *     relayed action; which replaced
 *   0xa35C9faC83e1673e6f1221979e2843Dea4812e78 (immediate-start, no combined DeleteFlow);
 *   0x0725db8cf32CDefa1e822CB336ca5caf4cbE69FD same code, paying fees to the deployer;
 *   0x576d1274Ef1E4e1f6093ffC1188c8D32411dDD65;
 *   0xa7AA0ff51Bf4a20A1E3516cFEa2C1aD44561a411 — the original feeless two-arg macro.
 */
export { dashboardClearMacroAbi } from "./dashboardClearMacroAbi.generated";

/** The macro's `lang` argument — bytes32("en"). */
export const CLEAR_MACRO_LANG = stringToHex("en", { size: 32 });

/** One Clear Macro action = one signed payload = one relayed transaction. */
export type ClearMacroAction =
  | { kind: "approve"; superToken: Address; spender: Address; amount: bigint }
  | { kind: "transfer"; superToken: Address; receiver: Address; amount: bigint }
  | { kind: "upgrade"; superToken: Address; amount: bigint }
  | { kind: "downgrade"; superToken: Address; amount: bigint }
  | { kind: "createFlow"; superToken: Address; receiver: Address; flowRate: bigint }
  | { kind: "updateFlow"; superToken: Address; receiver: Address; flowRate: bigint }
  | { kind: "deleteFlow"; superToken: Address; sender: Address; receiver: Address }
  | {
      kind: "scheduleFlow";
      superToken: Address;
      receiver: Address;
      startDate: number;
      flowRate: bigint;
      endDate: number;
    }
  | { kind: "deleteFlowSchedule"; superToken: Address; receiver: Address };

export type ClearMacroActionKind = ClearMacroAction["kind"];

/**
 * The macro's encode/describe function pair for an action, plus the params tuple
 * (viem accepts named-struct args as plain objects).
 */
export function getActionCallInfo(action: ClearMacroAction): {
  encodeFunctionName: string;
  describeFunctionName: string;
  tuple: Record<string, unknown>;
} {
  switch (action.kind) {
    case "approve":
      return {
        encodeFunctionName: "encodeApprove",
        describeFunctionName: "describeApprove",
        tuple: {
          superToken: action.superToken,
          spender: action.spender,
          amount: action.amount,
        },
      };
    case "transfer":
      return {
        encodeFunctionName: "encodeTransfer",
        describeFunctionName: "describeTransfer",
        tuple: {
          superToken: action.superToken,
          receiver: action.receiver,
          amount: action.amount,
        },
      };
    case "upgrade":
      return {
        encodeFunctionName: "encodeUpgrade",
        describeFunctionName: "describeUpgrade",
        tuple: { superToken: action.superToken, amount: action.amount },
      };
    case "downgrade":
      return {
        encodeFunctionName: "encodeDowngrade",
        describeFunctionName: "describeDowngrade",
        tuple: { superToken: action.superToken, amount: action.amount },
      };
    case "createFlow":
      return {
        encodeFunctionName: "encodeCreateFlow",
        describeFunctionName: "describeCreateFlow",
        tuple: {
          superToken: action.superToken,
          receiver: action.receiver,
          flowRate: action.flowRate,
        },
      };
    case "updateFlow":
      return {
        encodeFunctionName: "encodeUpdateFlow",
        describeFunctionName: "describeUpdateFlow",
        tuple: {
          superToken: action.superToken,
          receiver: action.receiver,
          flowRate: action.flowRate,
        },
      };
    case "deleteFlow":
      return {
        encodeFunctionName: "encodeDeleteFlow",
        describeFunctionName: "describeDeleteFlow",
        tuple: {
          superToken: action.superToken,
          sender: action.sender,
          receiver: action.receiver,
        },
      };
    case "scheduleFlow":
      return {
        encodeFunctionName: "encodeScheduleFlow",
        describeFunctionName: "describeScheduleFlow",
        tuple: {
          superToken: action.superToken,
          receiver: action.receiver,
          startDate: action.startDate,
          flowRate: action.flowRate,
          endDate: action.endDate,
        },
      };
    case "deleteFlowSchedule":
      return {
        encodeFunctionName: "encodeDeleteFlowSchedule",
        describeFunctionName: "describeDeleteFlowSchedule",
        tuple: { superToken: action.superToken, receiver: action.receiver },
      };
  }
}

/**
 * Resolves an EIP-712 `Action` message field by its PARSED name (from the macro's
 * `getActionTypeDefinition` at runtime — never assumed). `undefined` means the macro's
 * type definition names a field we don't know a value for; the caller must abort to the
 * fallback path, as guessing would produce an `InvalidSignature` revert on-chain.
 *
 * The deployed typedefs (read from OP Sepolia on 2026-06-11) name the super token field
 * `token` while the encode tuples name it `superToken` — all other fields match, e.g.
 * `Action(string description,address token,uint256 amount)` for Upgrade/Downgrade and
 * `Action(string description,address token,address sender,address receiver)` for DeleteFlow.
 */
export function resolveActionFieldValue(
  action: ClearMacroAction,
  description: string,
  fieldName: string
): unknown | undefined {
  if (fieldName === "description") return description;
  if (fieldName === "token") return action.superToken;
  if (fieldName === "kind") return undefined; // not a message field; guard against collision
  return (action as unknown as Record<string, unknown>)[fieldName];
}

/**
 * Parses an EIP-712 type-definition string (concatenated `TypeName(type name,...)` tokens,
 * as returned by `ClearMacroForwarder.getTypeDefinition`) into a viem `types` object.
 * Ported from the Clear Macro skill guide (superfluid-org/skills).
 */
export function parseEIP712TypeDef(typeDef: string) {
  const types: Record<string, { type: string; name: string }[]> = {};
  const re = /([A-Z]\w*)\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(typeDef)) !== null) {
    const [, typeName, fields] = m;
    types[typeName] =
      fields === ""
        ? []
        : fields.split(",").map((f) => {
            const parts = f.trim().split(" ");
            return { type: parts[0], name: parts[1] };
          });
  }
  return types;
}
