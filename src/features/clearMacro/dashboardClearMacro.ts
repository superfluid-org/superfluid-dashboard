import { type Address, stringToHex } from "viem";

/**
 * DashboardClearMacro ABI, generated from the Foundry project in `contracts/`
 * (regenerate with `pnpm contracts:abi`). The deployed OP Sepolia instance
 * (0x77232a2a953b570D1fEE1FE16b1902299fe7b898) predates the FlowScheduler actions —
 * the `*ScheduleFlow*`/`*FlowSchedule*` entries only work on-chain once the two-arg
 * macro is deployed (contracts/script/DeployDashboardClearMacro.s.sol) and
 * `macroAddress` in networks.ts points at it.
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
  | { kind: "deleteFlow"; superToken: Address; sender: Address; receiver: Address };

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
