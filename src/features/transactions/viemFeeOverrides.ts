// Viem-style transaction overrides: `gas` instead of ethers' `gasLimit`, plain bigints.
export interface ViemFeeOverrides {
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasPrice?: bigint;
  gas?: bigint;
}
