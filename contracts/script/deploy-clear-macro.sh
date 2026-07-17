#!/usr/bin/env bash
#
# Deploy (and optionally verify) DashboardClearMacro on one or more networks.
#
# Usage:
#   ./contracts/script/deploy-clear-macro.sh [--broadcast] [--verify] [--account <keystore>] <network ...|all>
#
#   ./contracts/script/deploy-clear-macro.sh all                # dry-run simulate on every eligible chain
#   ./contracts/script/deploy-clear-macro.sh --broadcast --verify --account hacked_dev optimism-sepolia
#   ./contracts/script/deploy-clear-macro.sh --verify optimism-sepolia   # verify the latest broadcast only
#
# Networks are the canonical superfluid-finance/metadata names (run with no args to list them). Constructor
# settings per chain live in DeployDashboardClearMacro.s.sol (`_defaultConfig`).
#
# Environment variables:
#   DEPLOYER_MNEMONIC       BIP-39 mnemonic of the deployer; the account at derivation index 0 is
#                           used. Highest precedence. The CI path (no keystore file exists there).
#   DEPLOYER_PRIVATE_KEY    deployer EOA key (raw hex). Used for --broadcast when no mnemonic is
#                           set; takes precedence over a keystore.
#   DEPLOYER_ACCOUNT        default for --account: a forge keystore, for --broadcast locally. Note: the
#                           plain keystore filename (e.g. `hacked_dev`), NOT the 0x-prefixed display name
#                           that `cast wallet list` shows.
#   ETHERSCAN_API_KEY       required for --verify (Etherscan v2 multichain API).
#   SUPERFLUID_HOST, FLOW_SCHEDULER, FEE_SUPER_TOKEN, BASE_FEE_AMOUNT, FEE_RECEIVER
#                           optional per-invocation overrides of the per-chain defaults in
#                           DeployDashboardClearMacro.s.sol (`_defaultConfig`).
#   RPC_URL_<chainId>       optional RPC override (e.g. RPC_URL_10);
#                           default https://rpc-endpoints.superfluid.dev/<network>.
#
# Simulation (the default) needs none of these.
#
# Verification runs standalone after broadcast (`forge script --root <dir> --verify` resolves its compiler
# cache from the CWD and fails from the repo root). Address and constructor args are read back from
# contracts/broadcast/.../run-latest.json so they always match the instance actually deployed.
#
# After a real deployment, wire the printed address into `dashboardClearMacro.macroAddress` for that network
# in src/features/network/networks.ts and extend the lineage comment in
# src/features/clearMacro/dashboardClearMacro.ts. See docs/plans/clear-macro-multi-network-deploy.md.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# Path resolved from CWD (not --root), so keep it absolute; the :ContractName suffix is required.
SCRIPT_SIG="$REPO_ROOT/contracts/script/DeployDashboardClearMacro.s.sol:DeployDashboardClearMacro"

ALL_NETWORKS=(
  eth-mainnet
  optimism-mainnet
  bsc-mainnet
  xdai-mainnet
  polygon-mainnet
  base-mainnet
  arbitrum-one
  avalanche-c
  optimism-sepolia
)

# macOS ships bash 3.2 (no associative arrays), hence case-based lookups.
chain_id_for() {
  case "$1" in
    eth-mainnet) echo 1 ;;
    optimism-mainnet) echo 10 ;;
    bsc-mainnet) echo 56 ;;
    xdai-mainnet) echo 100 ;;
    polygon-mainnet) echo 137 ;;
    base-mainnet) echo 8453 ;;
    arbitrum-one) echo 42161 ;;
    avalanche-c) echo 43114 ;;
    optimism-sepolia) echo 11155420 ;;
    *) return 1 ;;
  esac
}

rpc_url_for() { # <network> <chainId>
  local override_var="RPC_URL_$2"
  echo "${!override_var:-https://rpc-endpoints.superfluid.dev/$1}"
}

usage() {
  echo "Usage: $0 [--broadcast] [--verify] [--account <keystore>] <network ...|all>"
  echo "Networks: ${ALL_NETWORKS[*]}"
  exit 1
}

BROADCAST=false
VERIFY=false
ACCOUNT="${DEPLOYER_ACCOUNT:-}"
NETWORKS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --broadcast) BROADCAST=true; shift ;;
    --verify) VERIFY=true; shift ;;
    --account)
      [[ -n "${2:-}" && "${2:0:1}" != "-" ]] || { echo "--account needs a keystore name" >&2; usage; }
      ACCOUNT="$2"; shift 2 ;;
    --help|-h) usage ;;
    -*) echo "Unknown option: $1" >&2; usage ;;
    all) NETWORKS=("${ALL_NETWORKS[@]}"); shift ;;
    *)
      chain_id_for "$1" >/dev/null || { echo "Unknown network: $1" >&2; usage; }
      NETWORKS+=("$1"); shift ;;
  esac
done

[[ ${#NETWORKS[@]} -gt 0 ]] || usage

WALLET_ARGS=()
if $BROADCAST; then
  if [[ -n "${DEPLOYER_MNEMONIC:-}" ]]; then
    # CI/CD path: the ephemeral runner holds the mnemonic as a secret env var (no keystore file);
    # the deployer is the first derived account (index 0).
    WALLET_ARGS=(--mnemonics "$DEPLOYER_MNEMONIC" --mnemonic-indexes 0)
    echo "Deployer (mnemonic, index 0): $(cast wallet address --mnemonic "$DEPLOYER_MNEMONIC" --mnemonic-index 0)"
  elif [[ -n "${DEPLOYER_PRIVATE_KEY:-}" ]]; then
    WALLET_ARGS=(--private-key "$DEPLOYER_PRIVATE_KEY")
    echo "Deployer (private key): $(cast wallet address --private-key "$DEPLOYER_PRIVATE_KEY")"
  elif [[ -n "$ACCOUNT" ]]; then
    WALLET_ARGS=(--account "$ACCOUNT")
  else
    echo "Refusing to broadcast without a deployer: pass --account <keystore>, or set DEPLOYER_ACCOUNT, DEPLOYER_MNEMONIC, or DEPLOYER_PRIVATE_KEY." >&2
    exit 1
  fi
fi

if $VERIFY; then
  command -v jq >/dev/null || { echo "--verify needs jq." >&2; exit 1; }
  if [[ -z "${ETHERSCAN_API_KEY:-}" ]]; then
    echo "--verify needs ETHERSCAN_API_KEY (Etherscan v2 multichain API)." >&2
    exit 1
  fi
fi

verify_latest() { # <network> <chainId>
  local network="$1" chain_id="$2"
  local run_json="$REPO_ROOT/contracts/broadcast/DeployDashboardClearMacro.s.sol/$chain_id/run-latest.json"
  [[ -f "$run_json" ]] || { echo "No broadcast record for $network ($run_json); deploy first." >&2; return 1; }

  local create_count address encoded_args
  create_count="$(jq -r '[.transactions[] | select(.transactionType == "CREATE" and .contractName == "DashboardClearMacro")] | length' "$run_json")"
  if [[ "$create_count" != "1" ]]; then
    echo "Expected exactly one DashboardClearMacro CREATE in $run_json, found $create_count." >&2
    return 1
  fi
  address="$(jq -r '[.transactions[] | select(.transactionType == "CREATE" and .contractName == "DashboardClearMacro")][0].contractAddress' "$run_json")"
  # Use the args of the instance actually deployed — a stale copy-paste fails the bytecode-args match.
  encoded_args="$(jq -r '[.transactions[] | select(.transactionType == "CREATE" and .contractName == "DashboardClearMacro")][0].arguments | join(" ")' "$run_json" \
    | xargs cast abi-encode "constructor(address,address,address,uint256,address)")"

  local verifier_args=(--chain "$chain_id" --etherscan-api-key "$ETHERSCAN_API_KEY")

  echo "--- Verifying $network: $address"
  forge verify-contract "$address" src/DashboardClearMacro.sol:DashboardClearMacro \
    --root "$REPO_ROOT/contracts" "${verifier_args[@]}" --constructor-args "$encoded_args" --watch
}

deployed_address_for() { # <chainId>; prints the checksummed address from the latest broadcast, or "-"
  local run_json="$REPO_ROOT/contracts/broadcast/DeployDashboardClearMacro.s.sol/$1/run-latest.json"
  local address="-"
  if [[ -f "$run_json" ]] && command -v jq >/dev/null; then
    address="$(jq -r '[.transactions[] | select(.transactionType == "CREATE" and .contractName == "DashboardClearMacro")][0].contractAddress // "-"' "$run_json")"
  fi
  # The broadcast JSON stores the address lowercase; checksum it so the networks.ts snippet is exact.
  [[ "$address" == "-" ]] || address="$(cast to-check-sum-address "$address")"
  echo "$address"
}

SUMMARY=()
for network in "${NETWORKS[@]}"; do
  chain_id="$(chain_id_for "$network")"
  rpc_url="$(rpc_url_for "$network" "$chain_id")"

  if $BROADCAST; then
    echo "=== Deploying to $network (chain $chain_id) via $rpc_url"
    forge script "$SCRIPT_SIG" --root "$REPO_ROOT/contracts" --rpc-url "$rpc_url" \
      --broadcast "${WALLET_ARGS[@]}"
    SUMMARY+=("$network|$chain_id|$(deployed_address_for "$chain_id")")
  elif ! $VERIFY; then
    echo "=== Simulating on $network (chain $chain_id) via $rpc_url"
    # --skip-simulation: the script run itself still executes against forked state (config checks +
    # constructor); it only skips the tx gas-payment validation, which the unfunded default sender
    # cannot pass on OP-stack chains.
    forge script "$SCRIPT_SIG" --root "$REPO_ROOT/contracts" --rpc-url "$rpc_url" --skip-simulation
    SUMMARY+=("$network|$chain_id|(simulated)")
  fi

  if $VERIFY; then
    verify_latest "$network" "$chain_id"
    if ! $BROADCAST; then
      SUMMARY+=("$network|$chain_id|$(deployed_address_for "$chain_id")")
    fi
  fi
done

echo
echo "network | chainId | macroAddress"
echo "--------|---------|-------------"
for row in "${SUMMARY[@]}"; do
  echo "${row//|/ | }"
done

if $BROADCAST; then
  echo
  echo "networks.ts snippets (add inside each network's block):"
  for row in "${SUMMARY[@]}"; do
    IFS='|' read -r network chain_id address <<<"$row"
    [[ "$address" == "-" ]] && continue
    echo "  // $network ($chain_id)"
    echo "  dashboardClearMacro: {"
    echo "    macroAddress: \"$address\","
    echo "  },"
  done
  echo
  echo "NOTE: a deployment has no effect in the app until its dashboardClearMacro.macroAddress"
  echo "is added to the network's block in src/features/network/networks.ts (that entry is what"
  echo "enables the Clear Macro relay option there). Also extend the deployment lineage comment"
  echo "in src/features/clearMacro/dashboardClearMacro.ts."
fi
