import { type Address, stringToHex } from "viem";

/**
 * DashboardClearMacro ABI, generated from the Foundry project in `contracts/`
 * (regenerate with `pnpm contracts:abi`). The deployed OP Sepolia instance
 * (0xa35C9faC83e1673e6f1221979e2843Dea4812e78, set in networks.ts) is the five-arg
 * fee-charging macro from contracts/script/DeployDashboardClearMacro.s.sol —
 * fee token fUSDCx 0x131780640eDF9830099AaC2203229073D6D2FE69, base fee 0.01,
 * fee receiver 0x74cD5673dF7efC148067Ecab494A19a46b0a3167 (a fresh empty address, so
 * arriving fees are visible as its whole balance) — so every action AND the fee reads
 * (`previewRelayFee`/`feeToken`/`baseFee`) are live on-chain. This build adds
 * ScheduleFlow's immediate-start mode (startDate 0 + positive rate = create the flow now,
 * schedule only the stop). (It replaced same-code 0x0725db8cf32CDefa1e822CB336ca5caf4cbE69FD
 * which paid fees to the deployer, before that 0x576d1274Ef1E4e1f6093ffC1188c8D32411dDD65,
 * and originally the feeless two-arg 0xa7AA0ff51Bf4a20A1E3516cFEa2C1aD44561a411.)
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
